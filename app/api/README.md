# app/api

API 엔드포인트

## 디렉토리 구조

```
api/
├── validate/       # Phase 4: DRC 검증 API
├── coverage/       # Phase 4: 커버리지 분석 API
├── import/         # Phase 1: ESCO 스킬 임포트 API
└── ...
```

## API 엔드포인트 목록

| 엔드포인트 | Method | Phase | 설명 |
|------------|--------|-------|------|
| `/api/validate` | POST | Phase 4 | DRC 검증 실행 |
| `/api/coverage` | GET | Phase 4 | 커버리지 분석 |
| `/api/coverage/compare` | GET | Phase 4 | 도메인 간 비교 |
| `/api/import/esco` | POST | Phase 1 | ESCO 스킬 임포트 |
