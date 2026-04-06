# ESCON Phase 4: 프로덕션 모니터링 및 운영 가이드

## 개요

Phase 4는 프로덕션 환경의 에러 추적, 성능 모니터링, API 문서화, 감사 로깅을 자동화합니다. Sentry, Vercel Analytics, OpenAPI를 통해 실시간 모니터링을 가능하게 합니다.

---

## 1. 에러 추적 (Sentry)

### 설정

**필수 환경 변수**:
```
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx  # 서버 사이드
```

**Sentry 프로젝트 생성**:
1. https://sentry.io 접속
2. Create Project 클릭
3. Select Your Platform: **Next.js**
4. DSN 복사

### 클라이언트 사이드 에러 추적

```typescript
import { logErrorWithSentry } from '@/app/lib/sentry/sentry.client.config';

try {
  // 위험한 작업
} catch (error) {
  logErrorWithSentry(error, {
    context: 'skill-search',
    userId: currentUser.id,
  });
}
```

### 서버 사이드 에러 추적

```typescript
import { logServerError } from '@/app/lib/sentry/sentry.server.config';

try {
  await database.query(...);
} catch (error) {
  logServerError(error, {
    query: 'skill_search',
    userId: userId,
  });
}
```

### Sentry 대시보드 모니터링

**Sentry 대시보드**:
- Issues: 발생한 에러 목록
- Performance: API 응답 시간, 쿼리 성능
- Replays: 사용자 세션 재현 (에러 발생 시 자동 캡처)
- Release Health: 배포별 안정성

### 수동 메시지 로깅

```typescript
import { logMessageWithSentry } from '@/app/lib/sentry/sentry.client.config';

// 경고
logMessageWithSentry('Database connection slow', 'warning', {
  durationMs: 5000,
});

// 에러
logMessageWithSentry('Payment processing failed', 'error', {
  transactionId: '12345',
  reason: 'Timeout',
});
```

---

## 2. 성능 모니터링

### Core Web Vitals

**자동으로 추적되는 지표**:

| 지표 | 설명 | 목표값 | 추적 기능 |
|-----|------|-------|---------|
| **LCP** | Largest Contentful Paint | ≤ 2.5s | 페이지 로딩 속도 |
| **FID** | First Input Delay | ≤ 100ms | 상호작용 반응성 |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | 시각적 안정성 |
| **FCP** | First Contentful Paint | ≤ 1.8s | 콘텐츠 표시 속도 |
| **TTFB** | Time to First Byte | ≤ 600ms | 서버 응답성 |

### 커스텀 성능 지표

```typescript
import { reportCustomMetric, trackResourceTiming } from '@/app/lib/monitoring/web-vitals';

// 함수 실행 시간 측정
const startTime = performance.now();
await processSkills();
const duration = performance.now() - startTime;
reportCustomMetric('processSkills', duration);

// 리소스 로딩 시간 추적
trackResourceTiming('https://cdn.example.com/script.js');
```

### Vercel Analytics 대시보드

**대시보드 접속**:
1. Vercel 대시보드 → 프로젝트
2. Analytics 탭

**확인 항목**:
- 페이지별 성능
- Core Web Vitals 분포
- 에러율
- 응답 시간

---

## 3. API 문서화

### OpenAPI 스키마

**스키마 확인**:
```bash
curl https://escon.vercel.app/api/docs
```

**응답 형식**:
```json
{
  "openapi": "3.0.0",
  "info": { "title": "ESCON API", "version": "0.1.0" },
  "paths": { ... }
}
```

### Swagger UI

**대화형 문서**: https://escon.vercel.app/docs

**기능**:
- API 엔드포인트 탐색
- 요청/응답 스키마 확인
- Try it out으로 실시간 테스트

### API 엔드포인트

#### GET /api/audit-logs

감사 로그 조회

**쿼리 파라미터**:
```
tableName=skills&action=UPDATE&fromDate=2026-04-01T00:00:00Z&limit=20&offset=0
```

**응답**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-123",
        "tableName": "skills",
        "recordId": "skill-456",
        "action": "UPDATE",
        "changes": { "name": { "old": "Old Name", "new": "New Name" } },
        "createdBy": "user-123",
        "source": "api",
        "createdAt": "2026-04-06T10:30:00Z"
      }
    ],
    "total": 150,
    "limit": 20,
    "offset": 0
  },
  "timestamp": "2026-04-06T10:35:00Z",
  "requestId": "req-789"
}
```

---

## 4. 감사 로깅

### 감시 대상

모든 데이터 변경이 자동으로 기록됩니다:
- CREATE: 새 레코드 생성
- UPDATE: 레코드 수정
- DELETE: 레코드 삭제

### 감사 로그 조회

```typescript
// 특정 기술의 모든 변경 이력
GET /api/audit-logs?tableName=skills&recordId=skill-123

// 특정 날짜 범위의 UPDATE
GET /api/audit-logs?action=UPDATE&fromDate=2026-04-01&toDate=2026-04-06

// 조직 전체 감사 로그 (페이지네이션)
GET /api/audit-logs?limit=50&offset=100
```

### 감사 로그 시각화

**AuditLogViewer 컴포넌트** 사용:

```typescript
import AuditLogViewer from '@/app/components/AuditLogViewer';

export default function HistoryPage({ recordId }: { recordId: string }) {
  return <AuditLogViewer recordId={recordId} />;
}
```

---

## 5. 환경별 데이터베이스 관리

### 데이터베이스 초기화

```bash
npm run setup-database          # 인터랙티브 모드
npm run setup-database -- development   # 개발 환경
npm run setup-database -- staging       # 스테이징 환경
npm run setup-database -- production    # 프로덕션 환경
```

### 환경별 설정

| 환경 | 데이터베이스 | 용도 | 초기화 빈도 |
|-----|-----------|------|----------|
| **Development** | 로컬/테스트 | 로컬 개발 | 필요시 |
| **Staging** | 테스트 DB | QA 및 검증 | 주 1회 |
| **Production** | 실제 DB | 실제 운영 | 배포 시만 |

### 마이그레이션 스크립트

**위치**: `database/migrations/`

**파일 형식**: `NNN_description.sql`

**예시**:
```sql
-- 001_add_temporal_columns.sql
ALTER TABLE skills ADD COLUMN valid_from TIMESTAMP DEFAULT NOW();
ALTER TABLE skills ADD COLUMN valid_to TIMESTAMP;
```

### 마이그레이션 자동 실행

**배포 시 자동 실행** (GitHub Actions):
```yaml
- name: Setup Database
  run: npm run setup-database -- ${{ env.VERCEL_ENV }}
```

---

## 6. 배포 전 체크리스트

### Phase 4 활성화 전

- [ ] Sentry 프로젝트 생성
- [ ] 환경 변수 설정 (SENTRY_DSN)
- [ ] 로컬에서 npm install && npm run build 성공 확인
- [ ] npm run setup-database로 데이터베이스 마이그레이션 테스트

### 배포 후

- [ ] Sentry 대시보드에서 에러 추적 확인
- [ ] Vercel Analytics에서 성능 지표 확인
- [ ] API 문서 접속 확인 (https://escon.vercel.app/docs)
- [ ] 감사 로그 API 테스트
- [ ] Swagger UI에서 엔드포인트 확인

---

## 7. 트러블슈팅

### Q: Sentry에서 에러가 기록되지 않음

**A**: 환경 변수 확인
```bash
# 클라이언트 사이드
echo $NEXT_PUBLIC_SENTRY_DSN

# 서버 사이드
echo $SENTRY_DSN
```

재배포:
```bash
# Vercel 대시보드 → Deployments → 최신 배포 → Redeploy
```

### Q: 성능 지표가 수집되지 않음

**A**: 다음 확인
```bash
# 1. 브라우저 DevTools → Console에서 에러 확인
# 2. Network 탭에서 Sentry 요청 확인 (api.sentry.io)
# 3. Sentry DSN 유효성 확인
```

### Q: API 문서 (Swagger UI)가 로드되지 않음

**A**: 다음 순서로 확인
```bash
# 1. API 스키마 엔드포인트 확인
curl https://escon.vercel.app/api/docs

# 2. CDN에서 Swagger UI 스크립트 로드 확인
# 3. 브라우저 콘솔에서 CORS 에러 확인
```

### Q: 감사 로그가 기록되지 않음

**A**: 데이터베이스 테이블 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM audit_logs LIMIT 1;
SELECT COUNT(*) FROM audit_logs;
```

---

## 8. 성능 최적화 팁

### 에러 필터링

불필요한 에러를 제외하여 Sentry 요금 절감:

```typescript
// sentry.client.config.ts
ignoreErrors: [
  'chrome-extension://',     // 브라우저 확장
  'ResizeObserver',          // 불필요한 성능 경고
  'SecurityError',           // CORS 에러
],
```

### 샘플링 조정

**트레이스 샘플링** (성능 데이터):
```typescript
tracesSampleRate: 0.1,  // 10% 샘플링 (프로덕션)
// 개발 환경: 1.0 (100%)
```

**리플레이 샘플링** (세션 재현):
```typescript
replaysSessionSampleRate: 0.1,    // 10% 세션
replaysOnErrorSampleRate: 1.0,    // 에러는 항상 캡처
```

### 민감한 정보 보호

- API 키, 토큰 자동 제거
- 쿠키, 인증 헤더 제거
- 비밀번호, 개인정보 제거

---

## 9. 다음 단계 (Phase 5 - 선택사항)

- **실시간 알림**: Slack/이메일 알림 연동
- **커스텀 메트릭**: 비즈니스 로직 모니터링
- **A/B 테스트**: 성능 최적화 실험
- **로그 수집**: 중앙화된 로그 관리 (ELK Stack, Datadog 등)
- **예측 분석**: 시계열 데이터 분석으로 이상 탐지

---

## 참고 자료

- **Sentry 문서**: https://docs.sentry.io/
- **Vercel Analytics**: https://vercel.com/analytics
- **Web Vitals**: https://web.dev/vitals/
- **OpenAPI 3.0**: https://swagger.io/specification/
- **Supabase 감사 로그**: https://supabase.com/docs/guides/database/managing-data
