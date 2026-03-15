# MiroFish BM 적용 계획서

> 작성일: 2026-03-15
> 브랜치: feature/robot-smartfactory
> 참조 리포: https://github.com/foolpoet44/MiroFish

---

## 벤치마킹 배경

MiroFish는 멀티에이전트 AI 시뮬레이션 플랫폼으로, escon(스킬 온톨로지 플랫폼)과 구조적 문제 공간이 유사하다.
특히 ①LLM 기반 분석, ②단계별 워크플로우 UX, ③지식 그래프 파이프라인 측면에서 검증된 패턴을 보유하고 있어 직접 적용 가능성이 높다.

---

## 적용 로드맵

| 순위 | 항목 | 출처 파일 | escon 적용 대상 | 상태 |
|------|------|-----------|----------------|------|
| 즉시 | LLM 추상화 레이어 | `backend/app/utils/llm_client.py` | `app/lib/llm-client.ts` | ✅ 완료 |
| 단기 | 5단계 Step UI | `frontend/src/components/Step*.vue` | `app/components/SkillDiagnosisFlow/` | ✅ 완료 |
| 중기 | 온톨로지 자동 생성 | `backend/app/services/ontology_generator.py` | `app/api/ai/generate-ontology/` | 예정 |
| 중기 | 비동기 태스크 관리 | `backend/app/models/task.py` | `app/lib/task-manager.ts` | 예정 |
| 장기 | 에이전트 메모리 시스템 | `backend/app/services/zep_tools.py` | Supabase 기반 스킬 히스토리 | 예정 |

---

## 즉시 적용: LLM 추상화 레이어

### 문제 상황

현재 `app/api/ai/match-skills/route.ts`는 `@google/genai` SDK를 **직접 하드코딩**해서 사용 중이다.

```typescript
// 현재 코드 - 문제점: Google Gemini에 종속
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
```

이 방식의 위험:
- 모델을 Claude나 OpenAI로 바꾸려면 route 파일 전체를 수정해야 함
- API 키 관리가 분산됨
- 여러 API route에 동일한 초기화 코드가 반복될 가능성

### MiroFish의 해법

`llm_client.py`에서 OpenAI SDK를 래핑하여 **어떤 OpenAI 호환 모델이든** 환경변수 교체만으로 연결 가능하게 설계했다.

```python
# MiroFish 패턴
class LLMClient:
    def __init__(self, api_key, base_url, model):
        self.client = OpenAI(api_key=api_key, base_url=base_url)  # base_url로 제공자 교체
```

### escon 적용 설계

`app/lib/llm-client.ts` 생성:

```
환경변수 (LLM_PROVIDER=gemini|claude|openai)
    → LLMClient가 적절한 SDK 선택
    → route.ts는 LLMClient.chat()만 호출
```

**환경변수 추가** (`.env.local.example`):
```bash
# LLM 제공자 설정 (기본: gemini)
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
LLM_API_KEY=your-key  # 기존 GEMINI_API_KEY 대체 가능

# Claude로 전환 시
# LLM_PROVIDER=claude
# LLM_MODEL=claude-sonnet-4-6
# LLM_API_KEY=your-anthropic-key
```

**효과**: route.ts가 제공자에 의존하지 않게 되어, 향후 Claude API 전환 시 `.env.local`만 수정하면 된다.

---

## 단기 적용: 5단계 Step UI

### 문제 상황

현재 `/ai-match` 페이지는 **단일 폼 → 전체 결과** 방식으로, 사용자가 분석 과정을 이해하기 어렵다.

```
[현재] 직무 입력 → 버튼 클릭 → (로딩) → 전체 결과 덤프
```

### MiroFish의 해법

5개의 Vue 컴포넌트(`Step1GraphBuild.vue` ~ `Step5Interaction.vue`)가 순서대로 활성화되며, 사용자가 각 단계의 의미를 명확히 인식한다.

### escon 적용 설계

```
Step 1: 직무/역할 입력      → 채용공고 또는 직무 선택
Step 2: 현재 스킬 파악      → 도메인별 스킬 체크리스트
Step 3: AI 분석 실행        → 진행률 표시 + 중간 상태 메시지
Step 4: 스킬 갭 결과        → 우선순위별 추천 스킬 시각화
Step 5: 학습 로드맵         → 단기/중기/장기 목표 + 다음 액션
```

**컴포넌트 구조**:
```
app/components/SkillDiagnosisFlow/
├── index.tsx              # 전체 흐름 관리 (currentStep 상태)
├── StepIndicator.tsx      # 상단 진행 표시 바
├── Step1JobInput.tsx      # 직무 입력
├── Step2SkillCheckup.tsx  # 현재 스킬 자기진단
├── Step3Analyzing.tsx     # AI 분석 중 (로딩 UX)
├── Step4GapResult.tsx     # 스킬 갭 결과
└── Step5Roadmap.tsx       # 학습 로드맵
```

**효과**: 사용자가 "내가 지금 어느 단계에 있는지" 항상 인식하며, 각 단계를 통과할수록 결과에 대한 기대감이 형성된다. 기존 단일 폼 대비 완료율이 높아지는 UX 패턴.

---

## 중기 이후 계획 (예정)

### 온톨로지 자동 생성 (3-4주 후)

현재 스킬 데이터는 수작업으로 정의된 JSON이다. MiroFish의 `ontology_generator.py` 패턴을 참고하여 기업 JD 문서를 업로드하면 스킬 노드가 자동 추출되는 `app/api/ai/generate-ontology/` endpoint를 구현한다.

### 비동기 태스크 관리 (3-4주 후)

LLM 호출이 많아질수록 30초 이상 걸리는 작업이 늘어난다. MiroFish의 `TaskManager` 패턴을 참고하여 작업을 큐에 넣고 프론트엔드가 상태를 폴링하는 구조를 도입한다.

### 스킬 성장 히스토리 (장기)

MiroFish의 Zep Cloud 메모리 시스템을 Supabase로 대체하여, 사용자의 스킬 진단 히스토리를 누적 추적하는 기능을 구현한다.

---

## 구현 기록

- 2026-03-15: LLM 추상화 레이어 (`app/lib/llm-client.ts`) 구현 완료
- 2026-03-15: 5단계 Step UI (`app/components/SkillDiagnosisFlow/`) 구현 완료
- 2026-03-15: `app/api/ai/match-skills/route.ts` → LLMClient 적용 완료
- 2026-03-15: `app/ai-match/page.tsx` → Step 플로우로 교체 완료
