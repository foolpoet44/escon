-- Migration: 002_temporal_kg.sql
-- Description: Temporal Knowledge Graph 스키마 추가 (Sprint 2)
-- Dependencies: 001_add_temporal_columns.sql
-- Created: 2026-04-15

-- ============================================================================
-- STEP 1: 스킬 요구사항 테이블 (Phase 1: Requirement Analysis)
-- ============================================================================

CREATE TABLE IF NOT EXISTS skill_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('pulse_check', 'leadership_eval', 'manual', 'esco_import')),
    demand_level INTEGER NOT NULL CHECK (demand_level BETWEEN 1 AND 5),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ DEFAULT NULL,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT active_requirement UNIQUE (domain_id, skill_id, valid_to)
);

-- ============================================================================
-- STEP 2: 호환성 규칙 테이블 (Phase 2: Component Selection DRC)
-- ============================================================================

CREATE TABLE IF NOT EXISTS compatibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enabler_id TEXT NOT NULL,
    skill_category TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('mandatory', 'optional', 'forbidden')),
    compatibility_score DECIMAL(3,2) CHECK (compatibility_score BETWEEN 0 AND 1),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ DEFAULT NULL,
    rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- STEP 3: 온톨로지 스냅샷 테이블 (Variant Management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ontology_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_name TEXT NOT NULL,
    domain_id TEXT NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT,
    description TEXT,
    version TEXT DEFAULT '1.0'
);

-- ============================================================================
-- STEP 4: DRC 실행 이력 테이블
-- ============================================================================

CREATE TABLE IF NOT EXISTS validation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id TEXT,
    enabler_id TEXT,
    mode TEXT NOT NULL CHECK (mode IN ('rules', 'ai', 'full')),
    results JSONB NOT NULL,
    summary JSONB NOT NULL,
    execution_time_ms INTEGER,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_by TEXT
);

-- ============================================================================
-- STEP 5: ESCO 매핑 테이블 (임포트 파이프라인용)
-- ============================================================================

CREATE TABLE IF NOT EXISTS esco_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_skill_id TEXT NOT NULL,
    esco_uri TEXT NOT NULL UNIQUE,
    esco_label_ko TEXT,
    esco_label_en TEXT,
    esco_type TEXT CHECK (esco_type IN ('knowledge', 'skill/competence')),
    match_confidence DECIMAL(3,2) CHECK (match_confidence BETWEEN 0 AND 1),
    import_batch_id TEXT,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    imported_by TEXT
);

-- ============================================================================
-- STEP 6: 인덱스 생성
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_skill_req_domain ON skill_requirements(domain_id);
CREATE INDEX IF NOT EXISTS idx_skill_req_valid ON skill_requirements(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_skill_req_source ON skill_requirements(source_type);
CREATE INDEX IF NOT EXISTS idx_compat_enabler ON compatibility_rules(enabler_id);
CREATE INDEX IF NOT EXISTS idx_compat_valid ON compatibility_rules(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_snapshots_domain ON ontology_snapshots(domain_id);
CREATE INDEX IF NOT EXISTS idx_validation_domain ON validation_history(domain_id);
CREATE INDEX IF NOT EXISTS idx_validation_date ON validation_history(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_esco_internal ON esco_mappings(internal_skill_id);
CREATE INDEX IF NOT EXISTS idx_esco_uri ON esco_mappings(esco_uri);

-- ============================================================================
-- STEP 7: RLS (Row Level Security) 정책
-- ============================================================================

-- 스킬 요구사항
ALTER TABLE skill_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to skill_requirements"
    ON skill_requirements FOR SELECT
    TO authenticated
    USING (true);
CREATE POLICY "Allow service_role write access to skill_requirements"
    ON skill_requirements FOR ALL
    TO service_role
    USING (true);

-- 호환성 규칙
ALTER TABLE compatibility_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to compatibility_rules"
    ON compatibility_rules FOR SELECT
    TO authenticated
    USING (true);
CREATE POLICY "Allow service_role write access to compatibility_rules"
    ON compatibility_rules FOR ALL
    TO service_role
    USING (true);

-- 온톨로지 스냅샷
ALTER TABLE ontology_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to ontology_snapshots"
    ON ontology_snapshots FOR SELECT
    TO authenticated
    USING (true);
CREATE POLICY "Allow service_role write access to ontology_snapshots"
    ON ontology_snapshots FOR ALL
    TO service_role
    USING (true);

-- DRC 실행 이력
ALTER TABLE validation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to validation_history"
    ON validation_history FOR SELECT
    TO authenticated
    USING (true);
CREATE POLICY "Allow service_role write access to validation_history"
    ON validation_history FOR ALL
    TO service_role
    USING (true);

-- ESCO 매핑
ALTER TABLE esco_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access to esco_mappings"
    ON esco_mappings FOR SELECT
    TO authenticated
    USING (true);
CREATE POLICY "Allow service_role write access to esco_mappings"
    ON esco_mappings FOR ALL
    TO service_role
    USING (true);

-- ============================================================================
-- STEP 8: 유틸리티 뷰 (Views)
-- ============================================================================

-- 현재 유효한 스킬 요구사항
CREATE OR REPLACE VIEW active_skill_requirements AS
SELECT *
FROM skill_requirements
WHERE valid_from <= NOW()
  AND (valid_to IS NULL OR valid_to > NOW());

-- 현재 유효한 호환성 규칙
CREATE OR REPLACE VIEW active_compatibility_rules AS
SELECT *
FROM compatibility_rules
WHERE valid_from <= NOW()
  AND (valid_to IS NULL OR valid_to > NOW());

-- ============================================================================
-- STEP 9: 주석 (Comments)
-- ============================================================================

COMMENT ON TABLE skill_requirements IS '스킬 요구사항 (Phase 1: Requirement Analysis)';
COMMENT ON TABLE compatibility_rules IS '호환성 규칙 (Phase 2: Component Selection DRC)';
COMMENT ON TABLE ontology_snapshots IS '온톨로지 스냅샷 (Variant Management)';
COMMENT ON TABLE validation_history IS 'DRC 실행 이력';
COMMENT ON TABLE esco_mappings IS 'ESCO 스킬 매핑 테이블';

COMMENT ON COLUMN skill_requirements.source_type IS '요구 출처: pulse_check, leadership_eval, manual, esco_import';
COMMENT ON COLUMN skill_requirements.demand_level IS '수요 레벨 (1-5)';
COMMENT ON COLUMN skill_requirements.valid_to IS 'NULL 이면 현재 유효 (Temporal KG 패턴)';

COMMENT ON COLUMN compatibility_rules.rule_type IS '규칙 타입: mandatory(필수), optional(선택), forbidden(금지)';
