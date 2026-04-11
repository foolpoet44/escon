/**
 * SkillContextLoader
 *
 * 하네스 엔지니어링 첫 단계 — before_agent 훅
 *
 * 역할: 사용자 질문이 LLM에 가기 전에,
 *       Supabase에서 해당 사용자의 스킬 데이터를 읽어
 *       LLM이 이해할 수 있는 맥락 문자열로 변환한다.
 *
 * 비유: 임원 면담 전에 비서가 인사파일을 책상에 올려두는 것.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---- 타입 정의 ----

export interface SkillNode {
  id: string
  name: string
  level: number        // 1(인지) ~ 4(혁신)
  domain: string
  enabler?: string
}

export interface UserSkillProfile {
  userId: string
  currentSkills: SkillNode[]
  targetRole?: string
}

export interface SkillContext {
  profileSummary: string     // LLM에 주입할 맥락 문자열
  rawProfile: UserSkillProfile
}

// ---- 핵심 함수 ----

/**
 * loadSkillContext
 *
 * @param userId  - 조회할 사용자 ID
 * @returns       - LLM에 주입할 맥락 문자열 + 원본 데이터
 *
 * 사용 예:
 *   const ctx = await loadSkillContext('user-123')
 *   // ctx.profileSummary → 프롬프트 앞에 붙일 문자열
 */
export async function loadSkillContext(userId: string): Promise<SkillContext> {

  // Step 1: 사용자의 현재 스킬 목록 조회
  const { data: userSkills, error } = await supabase
    .from('user_skills')          // 테이블명 — 실제 스키마에 맞게 조정
    .select(`
      level,
      skill_nodes (
        id,
        name,
        domain,
        enabler
      )
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('[SkillContextLoader] Supabase 조회 실패:', error.message)
    // 실패해도 빈 맥락으로 LLM은 계속 동작 (graceful degradation)
    return buildEmptyContext(userId)
  }

  // Step 2: 데이터 정리
  const currentSkills: SkillNode[] = (userSkills ?? []).map((row: any) => ({
    id: row.skill_nodes?.id ?? '',
    name: row.skill_nodes?.name ?? '알 수 없음',
    level: row.level ?? 1,
    domain: row.skill_nodes?.domain ?? '미분류',
    enabler: row.skill_nodes?.enabler,
  }))

  const profile: UserSkillProfile = {
    userId,
    currentSkills,
  }

  // Step 3: LLM이 읽을 맥락 문자열 생성
  const profileSummary = buildProfileSummary(profile)

  return {
    profileSummary,
    rawProfile: profile,
  }
}

/**
 * buildProfileSummary
 *
 * 스킬 데이터를 LLM이 이해할 수 있는 자연어 블록으로 변환.
 * 이 문자열이 시스템 프롬프트 앞에 붙는다.
 */
function buildProfileSummary(profile: UserSkillProfile): string {
  if (profile.currentSkills.length === 0) {
    return `[ESCON 사용자 맥락]
등록된 스킬 데이터가 없습니다.
일반적인 엔지니어 성장 조언을 제공하되,
ESCON에 스킬을 등록하도록 안내해 주세요.`
  }

  // 도메인별로 묶기
  const byDomain: Record<string, SkillNode[]> = {}
  for (const skill of profile.currentSkills) {
    if (!byDomain[skill.domain]) byDomain[skill.domain] = []
    byDomain[skill.domain].push(skill)
  }

  const domainLines = Object.entries(byDomain)
    .map(([domain, skills]) => {
      const skillList = skills
        .map(s => `    - ${s.name} (LV${s.level})`)
        .join('\n')
      return `  [${domain}]\n${skillList}`
    })
    .join('\n')

  // 레벨 분포 요약
  const levelCounts = [1, 2, 3, 4].map(lv => {
    const count = profile.currentSkills.filter(s => s.level === lv).length
    const label = ['인지', '적용', '설계', '혁신'][lv - 1]
    return `LV${lv}(${label}): ${count}개`
  }).join(', ')

  return `[ESCON 사용자 스킬 맥락 — 이 데이터를 기반으로 답변하세요]

보유 스킬 총 ${profile.currentSkills.length}개
레벨 분포: ${levelCounts}

도메인별 스킬:
${domainLines}

---
답변 원칙:
1. 위 스킬 데이터를 반드시 참고하여 개인화된 조언을 제공하세요.
2. 스킬 레벨은 LV1(인지) → LV2(적용) → LV3(설계) → LV4(혁신) 기준입니다.
3. 추천 학습 경로는 현재 레벨에서 한 단계 위를 기준으로 제시하세요.
4. 불필요한 일반 조언은 제외하고, 이 사용자의 데이터에 집중하세요.`
}

function buildEmptyContext(userId: string): SkillContext {
  return {
    profileSummary: `[ESCON 사용자 맥락]
데이터를 불러오지 못했습니다. 일반 조언을 제공해 주세요.`,
    rawProfile: { userId, currentSkills: [] },
  }
}
