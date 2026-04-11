# ESCON Harness — Step 1: SkillContextLoader

하네스 엔지니어링 첫 단계 구현 파일 모음.

## 파일 구조

```
src/
├── lib/
│   └── skillContextLoader.ts   ← 핵심 (비서 역할)
├── app/
│   └── api/
│       └── chat/
│           └── route.ts        ← API 창구
└── components/
    └── ChatWidget.tsx          ← 화면 UI
```

## 각 파일의 역할

| 파일 | 역할 | 비유 |
|------|------|------|
| `skillContextLoader.ts` | Supabase에서 스킬 데이터 읽어서 LLM 맥락 생성 | 임원 면담 전 비서가 파일 준비 |
| `route.ts` | 질문 받아서 맥락 붙인 후 Claude에 전달 | 접수 창구 |
| `ChatWidget.tsx` | 사용자가 보는 채팅 화면 | 인터폰 |

## 설치 및 설정

### 1. 패키지 설치

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js
```

### 2. 환경변수 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Supabase 테이블 (없으면 생성)

```sql
-- 스킬 노드 테이블 (이미 있으면 스킵)
CREATE TABLE skill_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  enabler TEXT
);

-- 사용자-스킬 매핑 테이블
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  skill_node_id UUID REFERENCES skill_nodes(id),
  level INTEGER CHECK (level BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. 페이지에 ChatWidget 붙이기

```tsx
// app/page.tsx 또는 원하는 페이지
import { ChatWidget } from '@/components/ChatWidget'

export default function Page() {
  return (
    <main>
      {/* 기존 ESCON 컨텐츠 */}
      
      {/* 챗 위젯 추가 */}
      <div style={{ maxWidth: '600px', margin: '40px auto' }}>
        <ChatWidget userId="user-123" />
      </div>
    </main>
  )
}
```

## 데이터 흐름 (한 번에 보기)

```
사용자: "AI 쪽으로 가고 싶어요"
           ↓
    [route.ts] 질문 수신
           ↓
    [skillContextLoader.ts] Supabase 조회
    → user_skills 테이블에서 userId로 검색
    → 스킬 목록 + 레벨 데이터 취득
    → LLM용 맥락 문자열 생성
           ↓
    [Claude API] 맥락 + 질문 전달
           ↓
    "현재 LV2 Python 보유하셨네요.
     AI/ML로 가려면 LV3 목표로
     scikit-learn → PyTorch 순서 추천합니다."
```

## 다음 단계 (Step 2)

- `before_model` 훅 → GapHeuristicsInjector 추가
- Output Contract 검증 로직 추가
- 대화 히스토리 유지 (멀티턴)
