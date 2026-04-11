import { supabase } from './supabase'
import { SkillNode } from './skillContextLoader'

export interface GapAnalysisResult {
  hasTarget: boolean;
  targetRoleName?: string;
  urgentGaps: {
    skillName: string;
    currentLevel: number;
    requiredLevel: number;
    importance: number;
    gapScore: number;
  }[];
  summaryText: string;
}

/**
 * 현재 스킬 셋과 목표 역할(Enabler)을 비교하여 
 * LLM이 코칭에 활용할 수 있는 우선순위 갭 리포트를 생성합니다.
 */
export async function calculateGapHeuristics(
  currentSkills: SkillNode[], 
  targetEnablerId?: string
): Promise<GapAnalysisResult> {
  // 1. 보편적 시나리오: targetEnablerId가 없으면 첫 번째 Enabler(예: 시니어 풀스택)를 목표로 잡음
  let targetId = targetEnablerId;
  let targetName = '기본 목표 역할';

  if (!targetId) {
    const { data: defaultEnablers } = await supabase
      .from('enablers')
      .select('id, name')
      .order('created_at', { ascending: true })
      .limit(1);

    if (defaultEnablers && defaultEnablers.length > 0) {
      targetId = defaultEnablers[0].id;
      targetName = defaultEnablers[0].name;
    } else {
      return buildEmptyGapResult();
    }
  } else {
      const { data: targetEnabler } = await supabase
        .from('enablers')
        .select('name')
        .eq('id', targetId)
        .single();
      if (targetEnabler) targetName = targetEnabler.name;
  }

  // 2. 목표 역할의 필요 역량(skill_enabler_relations) 로드
  const { data: requirements, error } = await supabase
    .from('skill_enabler_relations')
    .select(`
      importance,
      proficiency,
      skills (
        id,
        korean_label,
        label
      )
    `)
    .eq('enabler_id', targetId);

  if (error || !requirements || requirements.length === 0) {
    return buildEmptyGapResult(targetName);
  }

  // 3. 갭 알고리즘: (필요 레벨 - 현재 레벨) * 중요도
  const gaps = []
  for (const req of requirements) {
    // Type 안전성을 위해 any 치환
    const reqData: any = req; 
    const skillId = reqData.skills?.id;
    const skillName = reqData.skills?.korean_label || reqData.skills?.label || '알 수 없는 스킬';
    const reqLevel = parseInt((reqData.proficiency || '').replace(/[^0-9]/g, '') || '1');
    const importance = reqData.importance || 3;

    // 사용자의 현재 스킬 레벨 대조 (등록되지 않은 경우 0)
    const currentUserSkill = currentSkills.find(s => s.id === skillId);
    const currentLevel = currentUserSkill ? currentUserSkill.level : 0;

    const levelDiff = reqLevel - currentLevel;
    
    // 아직 목표치에 도달하지 못한 경우
    if (levelDiff > 0) {
      const gapScore = levelDiff * importance;
      gaps.push({
        skillName,
        currentLevel,
        requiredLevel: reqLevel,
        importance,
        gapScore
      });
    }
  }

  // 우선순위 정렬 (Gap 점수 내림차순)
  gaps.sort((a, b) => b.gapScore - a.gapScore);

  // 상위 3개의 가장 시급한 문제 추출
  const urgentGaps = gaps.slice(0, 3);

  return {
    hasTarget: true,
    targetRoleName: targetName,
    urgentGaps,
    summaryText: buildGapSummary(targetName, urgentGaps)
  }
}

function buildEmptyGapResult(targetName?: string): GapAnalysisResult {
  return {
    hasTarget: false,
    targetRoleName: targetName,
    urgentGaps: [],
    summaryText: "설정된 목표 역할에 대한 구체적인 요구 역량 데이터가 없습니다."
  }
}

function buildGapSummary(targetName: string, urgentGaps: any[]): string {
  if (urgentGaps.length === 0) {
    return `\n[🏅 목표 달성: ${targetName}]\n현재 사용자는 해당 목표 역할에 필요한 모든 역량을 충분히 갖추고 있습니다!\n새로운 도전 과제를 제시해 주세요.`;
  }

  const gapLines = urgentGaps.map((g, i) => 
    `${i + 1}. [${g.skillName}] 부족: 목표 LV${g.requiredLevel} vs 현재 LV${g.currentLevel} (중요도: ${g.importance}, 시급도: ${g.gapScore}점)`
  ).join('\n');

  return `\n[🎯 타겟 갭 분석 리포트: ${targetName}]
아래는 사용자가 목표를 달성하기 위해 최우선으로 메워야 할 기술적 갭(Gap)입니다:

${gapLines}

---
[추가 코칭 지침]
위의 '타겟 갭 분석 리포트'를 바탕으로 가장 시급도(점수)가 높은 스킬 1가지를 선정하여, 다음 단계의 구체적인 학습 과제를 제시하세요.`;
}
