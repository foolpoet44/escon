-- Migration: 001_add_temporal_columns.sql
-- Description: Add Temporal Knowledge Graph (TKG) columns to support time-based skill validity
-- Created: 2026-04-06
-- Status: PENDING (Requires Supabase execution)

-- ============================================================================
-- STEP 1: 기존 스킬 테이블에 시간대 컬럼 추가
-- ============================================================================

-- Skills 테이블에 TKG 컬럼 추가
ALTER TABLE skills
ADD COLUMN valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN valid_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN version INTEGER DEFAULT 1;

-- Skill-Enabler Relations 테이블에 TKG 컬럼 추가
ALTER TABLE skill_enabler_relations
ADD COLUMN valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN valid_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN version INTEGER DEFAULT 1;

-- ============================================================================
-- STEP 2: 감사 로그 테이블 생성 (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

    -- 변경 대상 정보
    table_name VARCHAR(100) NOT NULL, -- 'skills', 'skill_enabler_relations' 등
    record_id UUID NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

    -- 변경 내용
    action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    changes JSONB NOT NULL, -- 변경된 필드들: {field: {old: value1, new: value2}}

    -- 메타데이터
    created_by VARCHAR(255), -- 사용자 ID 또는 시스템 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,

    -- 추적 정보
    session_id VARCHAR(255), -- 세션 추적용
    source VARCHAR(100) DEFAULT 'api' -- 'api', 'ui', 'migration', 'system'
);

-- ============================================================================
-- STEP 3: 인덱스 추가 (성능 최적화)
-- ============================================================================

-- 시간 범위 쿼리 성능 향상
CREATE INDEX idx_skills_valid_range ON skills(valid_from, valid_to);
CREATE INDEX idx_relations_valid_range ON skill_enabler_relations(valid_from, valid_to);

-- 감사 로그 쿼리 성능 향상
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);

-- ============================================================================
-- STEP 4: 뷰(View) 생성 - 활성 스킬만 조회
-- ============================================================================

-- 현재 시점에 유효한 스킬만 반환하는 뷰
CREATE OR REPLACE VIEW active_skills AS
SELECT *
FROM skills
WHERE valid_from <= NOW()
  AND (valid_to IS NULL OR valid_to > NOW());

-- 현재 시점에 유효한 관계만 반환하는 뷰
CREATE OR REPLACE VIEW active_skill_enabler_relations AS
SELECT *
FROM skill_enabler_relations
WHERE valid_from <= NOW()
  AND (valid_to IS NULL OR valid_to > NOW());

-- ============================================================================
-- STEP 5: 함수 생성 - 시간 범위 쿼리용
-- ============================================================================

-- 특정 시점의 스킬 스냅샷 조회 함수
CREATE OR REPLACE FUNCTION get_skills_at_timestamp(target_time TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
    id UUID,
    label VARCHAR,
    korean_label VARCHAR,
    english_label VARCHAR,
    type VARCHAR,
    uri VARCHAR,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    version INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.label,
        s.korean_label,
        s.english_label,
        s.type,
        s.uri,
        s.description,
        s.created_at,
        s.valid_from,
        s.valid_to,
        s.version
    FROM skills s
    WHERE s.valid_from <= target_time
      AND (s.valid_to IS NULL OR s.valid_to > target_time);
END;
$$ LANGUAGE plpgsql;

-- 기간별 스킬 변경 이력 조회 함수
CREATE OR REPLACE FUNCTION get_skill_versions(
    skill_id_param UUID,
    from_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    to_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    label VARCHAR,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    version INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.label,
        s.valid_from,
        s.valid_to,
        s.version
    FROM skills s
    WHERE s.id = skill_id_param
      AND (from_date IS NULL OR s.valid_from >= from_date)
      AND (to_date IS NULL OR s.valid_to <= to_date)
    ORDER BY s.valid_from DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: 데이터 마이그레이션 (기존 데이터)
-- ============================================================================

-- 기존 데이터의 valid_from을 created_at으로 설정
-- (이미 DEFAULT NOW()로 설정되어 있으므로 수동 변경 불필요)

-- ============================================================================
-- 마이그레이션 확인 스크립트
-- ============================================================================

/*
-- 마이그레이션 후 다음 쿼리로 확인:

-- 1. 컬럼 확인
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'skills' AND column_name IN ('valid_from', 'valid_to');

-- 2. 감사 로그 테이블 확인
SELECT COUNT(*) FROM audit_logs;

-- 3. 활성 스킬 뷰 확인
SELECT COUNT(*) FROM active_skills;

-- 4. 함수 확인
SELECT get_skills_at_timestamp(NOW());
*/
