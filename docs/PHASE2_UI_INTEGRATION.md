# Phase 2: UI 연동 - 로봇테크 for 스마트팩토리 대시보드 구축

## 개요

Phase 1에서 설계한 127개 로봇테크 스킬 데이터를 ESCON 프론트엔드에 통합하여, 사용자가 시각적으로 스킬을 탐색하고 학습 경로를 수립할 수 있도록 하는 단계.

---

## 작업 범위

### 1단계: 데이터 통합 (Data Integration)
- [x] robot-smartfactory.json 데이터 파일 생성 완료
- [ ] 기존 skills-data.ts에 로봇테크 데이터 로드 함수 추가
- [ ] TypeScript 타입 정의 (RobotSkill, RobotDomain)
- [ ] 통계 계산 함수 (도메인별, 역할별, 숙련도별)

**예상 시간**: 30분
**파일**: app/lib/skills-data.ts, app/lib/types.ts, app/lib/constants.ts

### 2단계: 도메인 필터 UI (Domain Filter UI)
- [ ] 로봇테크 도메인 6개를 DomainSelector에 추가
- [ ] 기존 도메인과 로봇테크 도메인 탭 분리
- [ ] 도메인별 스킬 개수 표시
- [ ] 반응형 디자인 적용

**예상 시간**: 45분
**파일**: app/components/DomainSelector.tsx, app/components/RobotDomainFilter.tsx (신규)

### 3단계: 로봇테크 대시보드 (Robot Skills Dashboard)
- [ ] 새 페이지 생성: app/robot-smartfactory/page.tsx
- [ ] 대시보드 레이아웃:
  - 상단: 전체 통계 (127개 스킬, 6개 도메인, 3개 역할)
  - 좌측: 필터 패널 (도메인, 역할, 숙련도)
  - 중앙: 스킬 카드 그리드
  - 우측: 상세 정보 (선택 시)

**예상 시간**: 90분
**파일**: app/robot-smartfactory/page.tsx (신규), app/components/RobotDashboard.tsx (신규)

### 4단계: 역할별 뷰 (Role-Based View)
- [ ] Operator 뷰: 운용 기본 스킬 (47개)
- [ ] Engineer 뷰: 시스템 통합 스킬 (127개)
- [ ] Developer 뷰: 알고리즘 개발 스킬 (39개)
- [ ] 역할별 학습 경로 시각화 (Knowledge → Skill → Competence)
- [ ] 각 역할의 필수 숙련도 표시

**예상 시간**: 120분
**파일**: app/components/RoleBasedView.tsx (신규), app/robot-smartfactory/[role]/page.tsx (신규)

### 5단계: 숙련도 시각화 (Proficiency Level Visualization)
- [ ] 프로그레시브 학습 경로 표시 (Level 1→2→3→4)
- [ ] 각 레벨별 스킬 분포 표시
  - Level 1 (기초): 7개 (5.5%)
  - Level 2 (중급): 47개 (37.0%)
  - Level 3 (고급): 55개 (43.3%)
  - Level 4 (전문가): 18개 (14.2%)
- [ ] 사용자의 현재 레벨 추적 (옵션)
- [ ] 추천 학습 순서

**예상 시간**: 90분
**파일**: app/components/ProficiencyTimeline.tsx (신규), app/components/SkillLevelBadge.tsx (신규)

### 6단계: 검색 & 필터링 고도화 (Advanced Search & Filtering)
- [ ] 검색 쿼리 지원:
  - `/robot-smartfactory?domain=industrial-robot-control`
  - `/robot-smartfactory?role=engineer`
  - `/robot-smartfactory?proficiency=3`
  - `/robot-smartfactory?domain=...&role=...&proficiency=...`
- [ ] 여러 조건 복합 필터링
- [ ] 필터링 결과 URL 공유 기능
- [ ] 검색 히스토리 저장 (옵션)

**예상 시간**: 60분
**파일**: app/robot-smartfactory/page.tsx (수정), app/lib/query-parser.ts (신규)

### 7단계: 스킬 상세 뷰 (Skill Detail View)
- [ ] 스킬 클릭 시 모달 또는 사이드 패널 표시
- [ ] 상세 정보:
  - 스킬명 (한영)
  - 설명 (한영)
  - 도메인
  - 스킬 타입 (Knowledge/Skill/Competence)
  - 숙련도 레벨
  - 관련 역할
  - 부모-자식 계층 관계
  - 스마트팩토리 현장 맥락
  - 관련 스킬 링크
- [ ] 한영 동시 표시

**예상 시간**: 75분
**파일**: app/components/RobotSkillDetail.tsx (신규), app/robot-smartfactory/skill/[skillId]/page.tsx (신규)

### 8단계: 스킬 카드 컴포넌트 (Skill Card Component)
- [ ] 기존 SkillCard 확장 또는 새 RobotSkillCard 생성
- [ ] 표시 항목:
  - 스킬 ID (RSF-[CODE]-[NUMBER])
  - 스킬명
  - 도메인 배지
  - 역할 아이콘 (Operator/Engineer/Developer)
  - 숙련도 배지 (1~4)
  - 스킬 타입 인디케이터
  - 호버 시 상세 설명

**예상 시간**: 45분
**파일**: app/components/RobotSkillCard.tsx (신규)

---

## 기술 스택

### 프론트엔드
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18
- **Styling**: CSS-in-JS
- **State Management**: React hooks (useState, useContext)
- **Data Fetching**: fetch API

### 컴포넌트 구조
```
app/
├── robot-smartfactory/
│   ├── page.tsx (메인 대시보드)
│   ├── [role]/
│   │   └── page.tsx (역할별 뷰)
│   └── skill/
│       └── [skillId]/
│           └── page.tsx (스킬 상세)
├── components/
│   ├── RobotDashboard.tsx (메인 컨테이너)
│   ├── RobotDomainFilter.tsx (도메인 필터)
│   ├── RoleBasedView.tsx (역할별 뷰)
│   ├── RobotSkillCard.tsx (스킬 카드)
│   ├── RobotSkillDetail.tsx (상세 뷰)
│   ├── ProficiencyTimeline.tsx (숙련도 타임라인)
│   ├── SkillLevelBadge.tsx (레벨 배지)
│   └── SkillTree.tsx (기존 - 활용)
└── lib/
    ├── skills-data.ts (수정)
    ├── types.ts (수정)
    ├── constants.ts (수정)
    └── query-parser.ts (신규)
```

---

## 데이터 흐름

```
public/data/robot-smartfactory.json
    ↓
app/lib/skills-data.ts (loadRobotSmartFactoryData)
    ↓
app/robot-smartfactory/page.tsx (RobotDashboard)
    ↓
Components (Filter, Card, Detail)
    ↓
User Interface
```

---

## 주요 기능

### 1. 도메인 필터
```typescript
// 예: 도메인별 스킬 조회
const industrialRobotSkills = skills.filter(
  s => s.domain === 'industrial-robot-control'
);
```

### 2. 역할별 뷰
```typescript
// 예: Engineer 역할의 모든 스킬
const engineerSkills = skills.filter(
  s => s.role_mapping.includes('engineer')
);
```

### 3. 숙련도별 분포
```typescript
// 예: Level 3 이상의 고급 스킬
const advancedSkills = skills.filter(
  s => s.proficiency_level >= 3
);
```

### 4. 3층 계층 구조 시각화
```
Knowledge (이론적 기초)
    ↓
Skill (실무 기술)
    ↓
Competence (현장 역량)
```

---

## 설계 가이드라인

### 색상 스킴
- **도메인별 색상**: 6개 도메인마다 고유 색상
  - 산업용 로봇 제어: Blue (#2563EB)
  - 머신비전: Purple (#9333EA)
  - 협동로봇: Green (#16A34A)
  - 자율이동로봇: Orange (#EA580C)
  - 유지보수: Red (#DC2626)
  - 디지털트윈: Cyan (#0891B2)

- **역할별 색상**:
  - Operator: Cyan
  - Engineer: Blue
  - Developer: Purple

- **숙진도별 색상**:
  - Level 1: Gray (기초)
  - Level 2: Yellow (중급)
  - Level 3: Blue (고급)
  - Level 4: Red (전문가)

### 반응형 디자인
- Desktop: 3열 그리드
- Tablet: 2열 그리드
- Mobile: 1열 그리드

---

## 테스트 계획

### 단위 테스트
- [ ] loadRobotSmartFactoryData() 함수
- [ ] 필터링 로직 (도메인, 역할, 숙련도)
- [ ] 통계 계산 함수

### 통합 테스트
- [ ] 대시보드 렌더링
- [ ] 필터 동작
- [ ] URL 쿼리 파싱
- [ ] 데이터 로딩

### E2E 테스트
- [ ] 도메인 선택 → 스킬 표시
- [ ] 역할 필터 → 관련 스킬 표시
- [ ] 숙련도 필터 → 해당 레벨 스킬 표시
- [ ] 스킬 클릭 → 상세 정보 표시

---

## 일정 및 마일스톤

| 단계 | 작업 | 시간 | 상태 |
|------|------|------|------|
| 1 | 데이터 통합 | 30분 | ⏳ 대기 |
| 2 | 도메인 필터 UI | 45분 | ⏳ 대기 |
| 3 | 로봇테크 대시보드 | 90분 | ⏳ 대기 |
| 4 | 역할별 뷰 | 120분 | ⏳ 대기 |
| 5 | 숙련도 시각화 | 90분 | ⏳ 대기 |
| 6 | 고급 필터링 | 60분 | ⏳ 대기 |
| 7 | 스킬 상세 뷰 | 75분 | ⏳ 대기 |
| 8 | 카드 컴포넌트 | 45분 | ⏳ 대기 |
| | **총합** | **555분 (9.25시간)** | |

---

## 성공 기준

- [x] robot-smartfactory.json 데이터 생성 (Phase 1 완료)
- [ ] 로봇테크 대시보드 UI 완성
- [ ] 모든 6개 도메인 표시
- [ ] 3개 역할별 필터링 작동
- [ ] 4단계 숙련도 시각화 표시
- [ ] 한영 동시 표시
- [ ] 반응형 디자인 적용
- [ ] 성능 최적화 (로딩 시간 < 1초)
- [ ] 모든 기능 테스트 완료

---

## 다음 단계 (Phase 3)

### 기존 ESCON 데이터와 통합
- 1,640개 기존 스킬과 127개 로봇테크 스킬의 관계 매핑
- 교차 참조 및 추천 시스템

### 학습 경로 생성
- "협동로봇 엔지니어로 성장하려면?" → 자동 학습 경로 제시
- 사용자의 현재 스킬 입력 → 부족 스킬 식별

### 인증/자격증 연동
- FANUC, ABB, KUKA 공식 교육 과정과 매핑
- Universal Robots 교육 커리큘럼 연계

---

## 개발 노트

### 주의사항
1. 기존 도메인 페이지와의 호환성 유지
2. 성능 최적화 (큰 JSON 파일 로딩)
3. SEO 최적화 (메타 태그, 구조화된 데이터)
4. 접근성 고려 (ARIA 속성, 키보드 네비게이션)

### 참고 자료
- 기존 SkillCard 컴포넌트
- 기존 DomainSelector 컴포넌트
- robot-smartfactory.json 스키마
- SMARTFACTORY_SKILL_DESIGN.md 설계 문서
