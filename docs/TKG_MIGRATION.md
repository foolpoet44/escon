# TKG (Temporal Knowledge Graph) 마이그레이션 가이드

## 개요

ESCON은 **시간 기반 스킬 데이터 관리**를 지원하는 TKG(Temporal Knowledge Graph) 아키텍처로 업그레이드됩니다. 이를 통해:

- ✅ 특정 기간의 스킬 데이터 조회
- ✅ 스킬의 시간 변화 추적 및 버전 관리
- ✅ 모든 변경사항의 감사 로그 기록
- ✅ 규정 준수 및 데이터 거버넌스

---

## 마이그레이션 단계

### Phase 1: Supabase 스키마 업데이트

**파일**: `database/migrations/001_add_temporal_columns.sql`

#### Step 1.1: SQL 마이그레이션 실행

Supabase 대시보드에서 실행:

```sql
-- 1. 기존 테이블에 시간대 컬럼 추가
ALTER TABLE skills
ADD COLUMN valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN valid_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN version INTEGER DEFAULT 1;

ALTER TABLE skill_enabler_relations
ADD COLUMN valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN valid_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN version INTEGER DEFAULT 1;
```

**검증**:
```sql
-- 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'skills'
  AND column_name IN ('valid_from', 'valid_to', 'version');
```

#### Step 1.2: 감사 로그 테이블 생성

```sql
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    changes JSONB NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    session_id VARCHAR(255),
    source VARCHAR(100) DEFAULT 'api'
);

-- 인덱스 추가
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
```

#### Step 1.3: 뷰 생성 (선택사항)

```sql
-- 현재 시점에 유효한 스킬만 반환
CREATE OR REPLACE VIEW active_skills AS
SELECT *
FROM skills
WHERE valid_from <= NOW()
  AND (valid_to IS NULL OR valid_to > NOW());

-- 현재 시점에 유효한 관계만 반환
CREATE OR REPLACE VIEW active_skill_enabler_relations AS
SELECT *
FROM skill_enabler_relations
WHERE valid_from <= NOW()
  AND (valid_to IS NULL OR valid_to > NOW());
```

---

### Phase 2: Node.js 마이그레이션 스크립트 실행

**파일**: `scripts/migrate-tkg.js`

#### Step 2.1: 환경 설정

`.env.local` 파일 생성:

```bash
# Supabase 연결 정보
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Step 2.2: 마이그레이션 실행

```bash
# 마이그레이션 스크립트 실행
node scripts/migrate-tkg.js
```

**예상 출력**:
```
🚀 TKG 마이그레이션 시작
============================================================

📋 [Step 1] 스키마 마이그레이션...
  ✅ 스키마 마이그레이션 완료

📊 [Step 2] 기존 데이터 검증...
  📈 Organizations: 5개
  📈 Skills: 150개
  📈 Relations: 420개

⏰ [Step 3] 시간대 컬럼 마이그레이션...
  🔄 150개 스킬의 valid_from 설정 중...
  ✓ 150/150 완료
  ✅ 시간대 컬럼 마이그레이션 완료

📝 [Step 4] 감사 로그 초기화...
  ✅ 감사 로그 초기화 완료

============================================================
📊 마이그레이션 완료 보고서
============================================================
✅ 모든 단계 완료!
```

---

## 새로운 컴포넌트 및 훅

### 1. TemporalRangeFilter

**위치**: `app/components/TemporalRangeFilter.tsx`

시간 범위를 선택하는 UI 컴포넌트:

```typescript
import TemporalRangeFilter from '@/components/TemporalRangeFilter'

export default function SkillsPage() {
  const handleRangeChange = (range) => {
    console.log('선택한 기간:', {
      from: range.from.toLocaleDateString('ko-KR'),
      to: range.to ? range.to.toLocaleDateString('ko-KR') : '진행 중'
    })
  }

  return (
    <TemporalRangeFilter
      onApply={(range) => fetchSkillsInRange(range)}
      onRangeChange={handleRangeChange}
    />
  )
}
```

**기능**:
- 프리셋: 전체 기간, 1년, 분기, 1개월
- 커스텀 범위 선택
- 시작/종료 날짜 입력
- 진행 중인 스킬 지원 (종료일 없음)

---

### 2. useAuditLogs Hook

**위치**: `app/lib/hooks/useAuditLogs.ts`

감사 로그 조회:

```typescript
import { useRecordHistory } from '@/lib/hooks/useAuditLogs'

export default function SkillDetail({ skillId }) {
  const { logs, loading, error } = useRecordHistory('skills', skillId)

  return (
    <div>
      {logs.map(log => (
        <div key={log.id}>
          <p>{log.action} - {new Date(log.created_at).toLocaleString('ko-KR')}</p>
          <p>변경자: {log.created_by}</p>
          <pre>{JSON.stringify(log.changes, null, 2)}</pre>
        </div>
      ))}
    </div>
  )
}
```

**지원하는 조회**:
- 단일 레코드 이력: `useRecordHistory(tableName, recordId)`
- 조직별 활동: `useOrganizationAuditLogs(organizationId)`
- 커스텀 필터: `useAuditLogs({ tableName, action, fromDate, toDate, ... })`

---

### 3. AuditLogViewer 컴포넌트

**위치**: `app/components/AuditLogViewer.tsx`

감사 로그를 타임라인으로 시각화:

```typescript
import AuditLogViewer from '@/components/AuditLogViewer'

export default function SkillChangeHistory({ skillId }) {
  return (
    <AuditLogViewer
      tableName="skills"
      recordId={skillId}
      title="스킬 변경 이력"
    />
  )
}
```

**기능**:
- 시간순 타임라인 표시
- CREATE/UPDATE/DELETE 구분 (색상 코딩)
- 변경 내용 전개/축소
- 작성자 및 소스 메타데이터

---

## 데이터 구조

### Skills 테이블 (확장)

```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    korean_label VARCHAR(255),
    english_label VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    uri VARCHAR(500) UNIQUE,
    description TEXT,
    
    -- TKG 컬럼 (신규)
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    version INTEGER,
    
    -- 메타데이터
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Audit Logs 테이블 (신규)

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    table_name VARCHAR(100),
    record_id UUID,
    organization_id UUID,
    action VARCHAR(50),  -- CREATE, UPDATE, DELETE
    changes JSONB,       -- {field: {old: val1, new: val2}}
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    session_id VARCHAR(255),
    source VARCHAR(100)  -- api, ui, migration, system
);
```

---

## 쿼리 예제

### 특정 시점의 스킬 조회

```sql
-- 2026년 1월 1일 현재 유효했던 스킬
SELECT * FROM skills
WHERE valid_from <= '2026-01-01'
  AND (valid_to IS NULL OR valid_to > '2026-01-01');
```

### 스킬의 버전 이력

```sql
-- 특정 스킬의 모든 버전
SELECT id, label, valid_from, valid_to, version
FROM skills
WHERE id = 'skill-uuid'
ORDER BY valid_from DESC;
```

### 변경 감사 로그

```sql
-- 특정 스킬의 모든 변경사항
SELECT action, changes, created_by, created_at
FROM audit_logs
WHERE table_name = 'skills'
  AND record_id = 'skill-uuid'
ORDER BY created_at DESC;
```

### 활성 스킬만 조회

```sql
-- 현재 시점에 유효한 스킬만
SELECT * FROM active_skills;
```

---

## API 엔드포인트 (향후 추가)

```typescript
// 시간 범위로 스킬 조회
GET /api/skills?from=2026-01-01&to=2026-12-31

// 특정 시점의 스킬 스냅샷
GET /api/skills/snapshot?date=2026-01-01

// 스킬 버전 이력
GET /api/skills/{id}/versions

// 감사 로그 조회
GET /api/audit-logs?tableName=skills&recordId={id}
```

---

## 테스트 체크리스트

- [ ] Supabase SQL 마이그레이션 완료
- [ ] 컬럼 추가 확인 (`DESCRIBE skills`)
- [ ] `audit_logs` 테이블 생성 확인
- [ ] Node.js 마이그레이션 스크립트 실행 완료
- [ ] 기존 데이터의 `valid_from` 값 확인
- [ ] TemporalRangeFilter 컴포넌트 렌더링 테스트
- [ ] 날짜 선택 기능 테스트
- [ ] AuditLogViewer 컴포넌트 렌더링 테스트
- [ ] 감사 로그 조회 테스트

---

## 문제 해결

### 에러: "audit_logs 테이블이 존재하지 않음"

**원인**: SQL 마이그레이션이 실행되지 않음

**해결책**:
1. Supabase 대시보드 → SQL Editor
2. `database/migrations/001_add_temporal_columns.sql` 내용 복사
3. 쿼리 실행

### 에러: "SUPABASE_URL이 설정되지 않음"

**원인**: `.env.local` 파일 누락

**해결책**:
```bash
cp .env.local.example .env.local
# 파일 수정하여 Supabase 정보 추가
```

### 마이그레이션이 느림

**원인**: 대량의 스킬 데이터 업데이트

**해결책**:
- 배치 크기 조정 (스크립트의 1000 변경)
- Supabase 성능 모니터링

---

## 향후 작업

### Phase 3: API 엔드포인트
- `GET /api/skills/snapshot` - 시간 기반 조회
- `GET /api/skills/{id}/versions` - 버전 이력
- `GET /api/audit-logs` - 감사 로그 API

### Phase 4: 고급 기능
- 시간 범위 기반 비교 (period comparison)
- 자동 감사 로그 생성 (트리거)
- 데이터 복구 (point-in-time restore)

---

## 참고 자료

- Supabase 문서: https://supabase.com/docs
- Temporal Database: https://en.wikipedia.org/wiki/Temporal_database
- ESCO 표준: https://ec.europa.eu/esco/portal
