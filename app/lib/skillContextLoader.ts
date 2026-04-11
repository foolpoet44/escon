import { supabase } from './supabase'
import { calculateGapHeuristics } from './gapHeuristicsInjector'

export interface SkillNode {
  id: string
  name: string
  level: number
  domain: string
  enabler?: string
}

export interface UserSkillProfile {
  userId: string
  currentSkills: SkillNode[]
  targetRole?: string
}

export interface SkillContext {
  profileSummary: string
  rawProfile: UserSkillProfile
}

/**
 * ESCON 사용자의 스킬 맥락을 로드한다.
 * 새로 추가된 user_skills 테이블을 조회하여 개인화된 스킬 프로필을 생성한다.
 */
export async function loadSkillContext(userId: string, targetEnablerId?: string): Promise<SkillContext> {
  const { data: userSkills, error } = await supabase
    .from('user_skills')
    .select(`
      level,
      skills (
        id,
        korean_label,
        type
      )
    `)
    .eq('user_id', userId)

  if (error || !userSkills || userSkills.length === 0) {
    console.warn('[SkillContextLoader] 스킬 데이터를 가져오지 못했습니다. (DB 테이블 미생성). 데모용 MOCK 프로필을 가동합니다:', error?.message)
    
    // 테이블 생성 전에도 ESCON 코치의 강력함을 보여주기 위한 임시 데이터 주입
    const mockSkills: SkillNode[] = [
      { id: 'mock1', name: '리액트 프론트엔드', level: 2, domain: 'skill/competence' },
      { id: 'mock2', name: '타입스크립트', level: 1, domain: 'knowledge' }
    ]
    
    const mockProfile: UserSkillProfile = { userId, currentSkills: mockSkills }
    const gapAnalysis = await calculateGapHeuristics(mockSkills, targetEnablerId)
    const profileSummary = buildProfileSummary(mockProfile, gapAnalysis.summaryText)

    return { profileSummary, rawProfile: mockProfile }
  }

  const currentSkills: SkillNode[] = userSkills.map((row: any) => ({
    id: row.skills?.id ?? '',
    name: row.skills?.korean_label ?? row.skills?.label ?? '알 수 없음',
    level: row.level ?? 1,
    domain: row.skills?.type ?? '미분류',
    enabler: 'Registered Skill',
  }))

  const profile: UserSkillProfile = { userId, currentSkills }
  
  // [+] Step 2: GapHeuristicsInjector 가동 (우선순위 갭 계산)
  const gapAnalysis = await calculateGapHeuristics(currentSkills, targetEnablerId);
  
  const profileSummary = buildProfileSummary(profile, gapAnalysis.summaryText)

  return { profileSummary, rawProfile: profile }
}

function buildProfileSummary(profile: UserSkillProfile, gapSummaryText: string): string {
  if (profile.currentSkills.length === 0) {
    return `[ESCON 사용자 맥락]
등록된 스킬 데이터가 없습니다.
일반적인 엔지니어 성장 조언을 제공하되,
ESCON에 스킬을 등록하도록 안내해 주세요.`
  }

  const byDomain: Record<string, SkillNode[]> = {}
  for (const skill of profile.currentSkills) {
    if (!byDomain[skill.domain]) byDomain[skill.domain] = []
    byDomain[skill.domain].push(skill)
  }

  const domainLines = Object.entries(byDomain)
    .map(([domain, skills]) => {
      const skillList = skills.map(s => `    - ${s.name} (LV${s.level})`).join('\n')
      return `  [${domain}]\n${skillList}`
    })
    .join('\n')

  const levelCounts = [1, 2, 3, 4].map(lv => {
    const count = profile.currentSkills.filter(s => s.level === lv).length
    const label = ['인지', '적용', '설계', '혁신'][lv - 1]
    return `LV${lv}(${label}): ${count}개`
  }).join(', ')

  return `[ESCON 현재 스킬 보유 현황]

보유 스킬 총 ${profile.currentSkills.length}개
레벨 분포: ${levelCounts}

도메인별 스킬:
${domainLines}
${gapSummaryText}
`
}

function buildEmptyContext(userId: string): SkillContext {
  return {
    profileSummary: `[ESCON 사용자 맥락]\n데이터를 불러오지 못했습니다. 일반 조언을 제공해 주세요.`,
    rawProfile: { userId, currentSkills: [] },
  }
}
