# ESCON: 엔지니어링 스킬 네트워크 매칭 시스템

**ESCON (Engineering Skill Network)**은 조직 내 직무 역량(Enabler)과 스킬(Skill) 간의 관계를 분석하고 시각화하는 웹 애플리케이션입니다.
로봇 솔루션, AI/ML 등 다양한 도메인의 스킬셋을 ESCO 표준과 매핑하여 체계적으로 관리하고, 도메인 간의 유사도를 비교 분석합니다.

![Project Banner](https://via.placeholder.com/1200x400?text=ESCON+Skill+Network+System)

## 🚀 주요 기능 (Features)

### 1. 🕸️ 스킬 네트워크 그래프 (Interactive Network Graph)
- **관계 시각화**: 스킬과 Enabler 간의 연결 관계를 노드-링크 다이어그램으로 표현
- **인터랙션**: 줌/팬(Zoom/Pan) 컨트롤, 노드 클릭 시 스마트 포커싱, 드래그 지원
- **필터링**: 특정 Enabler 선택 시 관련 스킬만 하이라이트

### 2. 🌳 계층적 스킬 트리 (Skill Tree View)
- **구조적 탐색**: 조직 -> Enabler -> Skill로 이어지는 계층 구조 시각화
- **상세 정보**: 노드별 중요도(Importance), 숙련도(Proficiency) 정보 툴팁 제공
- **자동 정렬**: 화면 중앙 정렬 및 반응형 레이아웃 지원

### 3. ⚖️ 도메인 비교 분석 (Domain Comparison)
- **유사도 분석**: 두 도메인 간의 Jaccard Similarity 점수 산출
- **구성 비교**: 지식(Knowledge) vs 역량(Competence) 분포 차트 제공
- **공통/고유 스킬 도출**: 공통 스킬과 각 도메인의 독자적 스킬 리스트 자동 분류

### 4. 📝 데이터 관리 및 활용
- **상세 페이지**: 각 Enabler별 상세 스킬 목록 조회 및 필터링
- **내보내기 (Export)**: 분석 결과를 CSV, JSON 형식으로 다운로드
- **검색**: 스킬명, 키워드로 전체 트리/그래프 내 검색 지원

## 🛠 기술 스택 (Tech Stack)

| 구분 | 기술 | 설명 |
|---|---|---|
| **Framework** | Next.js 14 | App Router 기반의 모던 웹 프레임워크 |
| **Language** | TypeScript | 정적 타입 시스템을 통한 안정성 확보 |
| **Database** | Supabase | PostgreSQL 기반의 관계형 데이터베이스 (Phase 3 진행 중) |
| **Visualization** | D3.js | 데이터 시각화 핵심 라이브러리 |
| **Graph Lib** | React Force Graph | 고성능 2D/3D 네트워크 그래프 렌더링 |
| **Tree Lib** | React D3 Tree | 계층적 트리 구조 시각화 |
| **Charts** | Recharts | 반응형 통계 차트 구현 |

## 🏁 시작하기 (Getting Started)

### 1. 설치 (Installation)
프로젝트를 클론하고 의존성을 설치합니다.

```bash
git clone https://github.com/your-repo/escon.git
cd escon
npm install
```

### 2. 환경 설정 (Configuration)
루트 디렉토리에 `.env.local` 파일을 생성하고 Supabase 연결 정보를 입력합니다.
(DB 연동이 필요 없는 경우, Phase 3 전까지는 생략 가능)

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 3. 실행 (Run)
개발 서버를 실행합니다.

```bash
npm run dev
# 접속: http://localhost:3000
```

### 4. 데이터베이스 마이그레이션 (Optional)
JSON 데이터를 Supabase로 이관하려면 다음 스크립트를 실행합니다.

```bash
node scripts/migrate.js
```

## 📂 프로젝트 구조 (Structure)

```
escon/
├── app/
│   ├── components/    # 재사용 가능한 UI 컴포넌트 (Graph, Tree, Loader 등)
│   ├── lib/           # 유틸리티 함수 및 데이터 처리 로직
│   ├── network/       # 네트워크 그래프 페이지
│   ├── tree/          # 스킬 트리 페이지
│   ├── compare/       # 도메인 비교 페이지
│   └── ...
├── public/
│   └── data/          # 초기 데이터 (JSON)
├── scripts/           # 마이그레이션 등 유지보수 스크립트
├── database/          # SQL 스키마 파일
└── docs/              # 기획서 및 프로젝트 문서
```

## 📄 라이선스 (License)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
