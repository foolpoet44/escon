require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

async function evaluateAgent() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
        console.error("❌ API 키를 찾을 수 없습니다.");
        return;
    }
    const ai = new GoogleGenAI({ apiKey });
    
    console.log("🏃‍♂️ [EVAL] ESCON AI 코칭 정답률(Correctness) 회귀 테스트 시작...");
    
    // 1. 모의 환경 프롬프트 세팅 (User: React=1, Target: React=4)
    // 이것은 loadSkillContext와 gapHeuristicsInjector가 만들어내는 문자열의 완벽한 모조품입니다.
    const systemPrompt = `당신은 ESCON(Engineering Skill Competency Navigator)입니다.
엔지니어의 스킬 성장 경로를 함께 설계하는 전문 코치입니다.

[🎯 타겟 갭 분석 리포트: 시니어 아키텍트]
아래는 사용자가 목표를 달성하기 위해 최우선으로 메워야 할 기술적 갭(Gap)입니다:
1. [리액트 프론트엔드] 부족: 목표 LV4 vs 현재 LV1 (중요도: 5, 시급도: 15점)
2. [도커] 부족: 목표 LV2 vs 현재 LV0 (중요도: 3, 시급도: 6점)

---
[추가 코칭 지침]
가장 시급도(점수)가 높은 스킬 1가지를 선정하여, 학습 과제를 제시하세요.`;
    
    const userMessage = "제가 목표로 가기 위해 지금 당장 해야 할 일이 뭔가요?";
    
    console.log(`\n📌 [Step 1] 테스트 시나리오 주입 중...
- 현재 상태: React LV1, Docker LV0
- 진단 결과(Harness): React 갭 위험도 최상 (15점)
- 질문: "${userMessage}"`);

    // 2. 에이전트 실행 (우리의 채팅 애플리케이션의 역할을 모방)
    const response = await ai.models.generateContent({
        model: process.env.LLM_MODEL || 'gemini-2.5-flash',
        contents: userMessage,
        config: { 
            systemInstruction: systemPrompt,
            temperature: 0.1 // 평가를 위해 일관성 높임
        }
    });
    const agentAnswer = response.text;
    console.log(`\n🤖 [에이전트 답변 분석 중...]`);
    console.log(`--------------------------------------------------\n${agentAnswer}\n--------------------------------------------------`);

    // 3. LLM-as-a-Judge 평가 (심판 에이전트)
    console.log("\n⚖️  [Step 2] 심판 모델(LLM-as-a-Judge)을 통한 무결성 평가...");
    const judgePrompt = `너는 AI 상담 퀄리티를 엄격하게 평가하는 심판이다.
우리의 봇(상담사)이 시스템(하네스)이 던져준 팩트를 정확히 전달했는지 평가해라.

체크리스트:
1. '리액트 프론트엔드' (또는 React) 를 1순위로 정확히 짚어냈는가?
2. 현재가 LV1이고 목표가 LV4라는 구체적인 갭(수치)을 포함하여 설명했는가?
3. 도커보다 리액트를 우선순위에 두었는가?

[상담사의 답변]
${agentAnswer}

답변 형식: 
반드시 "결과: PASS" 또는 "결과: FAIL" 로 시작하고, 그 뒤에 이유를 2줄 이내로 서술해.`;

    const judgeRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: judgePrompt,
        config: { temperature: 0.1 }
    });
    
    const verdict = judgeRes.text;
    console.log(`\n📝 [평가 결과]\n${verdict}`);
    
    if(verdict.includes("PASS")) {
        console.log("\n✅ 회귀 테스트(EVAL) 통과! 하네스가 모델을 완벽히 통제하고 있습니다.");
    } else {
        console.log("\n❌ 회귀 테스트(EVAL) 실패! 프롬프트 엔지니어링이나 미들웨어 훅 수정이 필요합니다.");
    }
}
evaluateAgent();
