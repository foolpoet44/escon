/**
 * DRC 엔진용 데이터 로더
 * public/data/ 디렉토리의 JSON 파일을 로드하여 DRC 컨텍스트 생성
 */

import type { Domain, Enabler, EnablerSkill, Skill } from './types'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 로봇스마트팩토리 데이터 로드
 */
export async function loadRobotSmartfactoryData(): Promise<Domain> {
  // 서버 사이드에서만 동작
  if (typeof window !== 'undefined') {
    throw new Error('데이터 로드는 서버 사이드에서만 가능합니다')
  }

  const dataPath = path.join(
    process.cwd(),
    'public',
    'data',
    'organizations',
    'robot-solution.json'
  )

  const fileContent = fs.readFileSync(dataPath, 'utf-8')
  const raw = JSON.parse(fileContent)

  // Domain 으로 변환
  const domain: Domain = {
    id: raw.organization.id,
    name: raw.organization.name,
    name_en: raw.organization.name_en,
    description: raw.organization.description,
    enablers: raw.enablers.map((enabler: any) => ({
      id: enabler.id,
      name: enabler.name,
      name_en: enabler.name_en,
      description: enabler.description,
      priority: enabler.priority,
      skills: enabler.skills.map((skill: any) => ({
        skill_id: skill.skill_id,
        esco_uri: skill.esco_uri,
        custom_uri: skill.custom_uri,
        label_ko: skill.label_ko,
        label_en: skill.label_en,
        type: skill.type as 'knowledge' | 'skill/competence',
        importance: skill.importance,
        target_proficiency: skill.target_proficiency,
        priority_rank: skill.priority_rank,
        match_type: skill.match_type as 'exact' | 'approximate' | 'custom',
        notes: skill.notes,
      })) as EnablerSkill[],
    })) as Enabler[],
  }

  return domain
}

/**
 * 개별 스킬 파일 로드 (skill_details/)
 */
export async function loadSkillDetails(skillId: string): Promise<Skill | null> {
  if (typeof window !== 'undefined') {
    throw new Error('데이터 로드는 서버 사이드에서만 가능합니다')
  }

  const skillPath = path.join(
    process.cwd(),
    'public',
    'data',
    'robot-smartfactory',
    'skills',
    `${skillId}.json`
  )

  try {
    const fileContent = fs.readFileSync(skillPath, 'utf-8')
    const raw = JSON.parse(fileContent)

    return {
      skill_id: raw.skill_id,
      domain: raw.domain,
      domain_en: raw.domain_en,
      esco_uri: raw.esco_uri,
      preferred_label_ko: raw.preferred_label_ko,
      preferred_label_en: raw.preferred_label_en,
      description_ko: raw.description_ko,
      description_en: raw.description_en,
      skill_type: raw.skill_type as 'knowledge' | 'skill/competence',
      proficiency_level: raw.proficiency_level,
      role_mapping: raw.role_mapping,
      parent_skill_id: raw.parent_skill_id,
      related_skills: raw.related_skills,
    }
  } catch (error) {
    console.error(`스킬 파일을 찾을 수 없음: ${skillId}`, error)
    return null
  }
}

/**
 * 전체 스킬 풀 로드
 */
export async function loadAllSkills(domainId: string): Promise<Skill[]> {
  if (typeof window !== 'undefined') {
    throw new Error('데이터 로드는 서버 사이드에서만 가능합니다')
  }

  const skillsDir = path.join(
    process.cwd(),
    'public',
    'data',
    'robot-smartfactory',
    'skills'
  )

  const files = fs.readdirSync(skillsDir)
  const skills: Skill[] = []

  for (const file of files) {
    if (!file.endsWith('.json')) continue

    try {
      const content = fs.readFileSync(path.join(skillsDir, file), 'utf-8')
      const raw = JSON.parse(content)

      if (raw.domain === domainId || !domainId) {
        skills.push({
          skill_id: raw.skill_id,
          domain: raw.domain,
          domain_en: raw.domain_en,
          esco_uri: raw.esco_uri,
          preferred_label_ko: raw.preferred_label_ko,
          preferred_label_en: raw.preferred_label_en,
          description_ko: raw.description_ko,
          description_en: raw.description_en,
          skill_type: raw.skill_type as 'knowledge' | 'skill/competence',
          proficiency_level: raw.proficiency_level,
          role_mapping: raw.role_mapping,
          parent_skill_id: raw.parent_skill_id,
          related_skills: raw.related_skills,
        })
      }
    } catch (error) {
      console.error(`스킬 로드 오류: ${file}`, error)
    }
  }

  return skills
}

/**
 * DRC 컨텍스트 생성
 */
export async function createDRCContext(
  domain: Domain,
  enablerId?: string
): Promise<{
  domain: Domain
  allEnablers: Enabler[]
  allSkills: Skill[]
  targetEnabler?: Enabler
  targetSkills?: EnablerSkill[]
}> {
  const allSkills = await loadAllSkills(domain.id)

  if (enablerId) {
    const targetEnabler = domain.enablers.find((e) => e.id === enablerId)
    if (!targetEnabler) {
      throw new Error(`Enabler '${enablerId}' 를 찾을 수 없습니다`)
    }

    return {
      domain,
      allEnablers: domain.enablers,
      allSkills,
      targetEnabler,
      targetSkills: targetEnabler.skills,
    }
  }

  return {
    domain,
    allEnablers: domain.enablers,
    allSkills,
  }
}
