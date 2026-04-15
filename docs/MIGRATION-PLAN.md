# Next.js 마이그레이션 계획

## 현재 상태

- **Current Version**: Next.js 13.5.6 (deprecated)
- **Target Version**: Next.js 14.x (patched)

## 보안 취약점 분석 (npm audit)

### Critical (1개)
- **Next.js Server-Side Request Forgery in Server Actions**
  - Next.js 13.5.6 은 알려진 SSRF 취약점 포함
  - 해결: `npm audit fix --force`로 Next.js 13.5.11+ 로 업그레이드

### High (7 개)
| 패키지 | 취약점 | 해결방안 |
|--------|--------|----------|
| lodash-es | Prototype Injection | `npm audit fix` |
| minimatch | ReDoS | `npm audit fix` |
| rollup | Path Traversal | `@sentry/nextjs` 업그레이드 필요 |
| socket.io-parser | DoS | `npm audit fix` |
| mermaid | XSS | 간접 의존성, 상위 패키지 대기 |
| @typescript-eslint/parser | ReDoS | ESLint 업데이트 필요 |
| dompurify | XSS | `npm audit fix` |

### Moderate (8 개)
- brace-expansion: process hang
- dompurify: mutation-XSS 외 3 건
- 기타 deprecated 패키지들

## Next.js 14.x 마이그레이션 영향도 분석

### 예상 변경 사항

#### 1. App Router API 변경
Next.js 13.5 → 14.x 에서 주요 변경:
- `loading.js` 스트리밍 동작 개선
- `error.js` 에러 바운더리 동작 변경
- Metadata API 확장

#### 2. 현재 사용 중인 주요 기능
- App Router (app/ 디렉토리)
- Server Components
- TypeScript strict 모드
- Sentry 통합 (`@sentry/nextjs ^8.0.0`)

#### 3. 호환성 확인 필요 항목
| 항목 | 현재 상태 | 확인 필요 |
|------|-----------|-----------|
| `@sentry/nextjs` | ^8.0.0 | Next.js 14.x 호환 확인 필요 |
| `socket.io` | ^4.6.1 | App Router 와 호환 |
| `yjs` + `y-websocket` | CRDT | 서버 구성 확인 필요 |

### 예상 작업량

| 작업 | 파일 수 | 예상 시간 |
|------|---------|-----------|
| package.json 업데이트 | 1 | 10 분 |
| `@sentry/nextjs` 업그레이드 | 1 | 30 분 |
| App Router 동작 테스트 | 5 페이지 | 2 시간 |
| 빌드/타입 에러 수정 | TBD | TBD |
| E2E 테스트 | 전체 | 1 시간 |
| **총계** | | **~4 시간** |

## 마이그레이션 단계

### Phase 1: 준비
1. [ ] 현재 브랜치 백업
2. [ ] `git checkout -b upgrade/nextjs-14`
3. [ ] `MIGRATION-PLAN.md` 작성 (완료)

### Phase 2: 의존성 업그레이드
1. [ ] `next` 13.5.6 → 14.2.x
2. [ ] `@sentry/nextjs` ^8.0.0 → ^9.0.0
3. [ ] `npm audit fix` 실행
4. [ ] `npm run build` 검증

### Phase 3: 테스트
1. [ ] 타입 체크: `npm run type-check`
2. [ ] 유닛 테스트: `npm test`
3. [ ] Dev 서버 동작 확인: `npm run dev`
4. [ ] 주요 페이지 기능 테스트

### Phase 4: 배포
1. [ ] PR 생성
2. [ ] 코드 리뷰
3. [ ] merge 후 배포

## 참고 링크

- [Next.js 14.0 Release Notes](https://nextjs.org/blog/next-14)
- [Next.js Security Advisory](https://github.com/advisories/GHSA-qpjv-v59x-3qc4)
- [Migration Guide from 13 to 14](https://nextjs.org/docs/app/building-your-application/upgrading)
