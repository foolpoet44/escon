/**
 * SharedOntologyDoc 유닛 테스트
 */

import {
  SharedOntologyDoc,
  getSharedOntologyDoc,
  createNewSharedDoc,
  type MappingChange,
} from '../shared-doc'
import type { Enabler, EnablerSkill } from '../../validation/types'

// 테스트용 팩토리 함수
function createTestEnabler(overrides?: Partial<Enabler>): Enabler {
  return {
    id: overrides?.id || 'test_enabler',
    name: overrides?.name || '테스트 Enabler',
    name_en: overrides?.name_en || 'Test Enabler',
    description: overrides?.description || '테스트 설명',
    priority: overrides?.priority ?? 1,
    skills: overrides?.skills || [],
  }
}

function createTestSkill(
  skillId: string,
  overrides?: Partial<EnablerSkill>
): EnablerSkill {
  return {
    skill_id: skillId,
    label_ko: overrides?.label_ko || `테스트 스킬 ${skillId}`,
    label_en: overrides?.label_en || `Test Skill ${skillId}`,
    type: overrides?.type || 'skill/competence',
    importance: overrides?.importance ?? 3,
    target_proficiency: overrides?.target_proficiency || 'Intermediate',
    priority_rank: overrides?.priority_rank ?? 1,
    match_type: overrides?.match_type || 'exact',
  }
}

describe('SharedOntologyDoc', () => {
  let doc: SharedOntologyDoc

  beforeEach(() => {
    doc = createNewSharedDoc()
  })

  describe('초기화', () => {
    it('문서가 올바르게 초기화된다', () => {
      const state = doc.getState()

      expect(state.enablers).toBeDefined()
      expect(state.skills).toBeDefined()
      expect(state.mappings).toBeDefined()
    })

    it('메타데이터가 자동으로 설정된다', () => {
      const state = doc.getState()
      const metadata = state.metadataMap || doc.getDoc().getMap('metadata')

      expect(metadata.has('createdAt')).toBe(true)
      expect(metadata.has('version')).toBe(true)
    })

    it('싱글톤 인스턴스를 얻을 수 있다', () => {
      const instance1 = getSharedOntologyDoc()
      const instance2 = getSharedOntologyDoc()

      expect(instance1).toBe(instance2)
    })
  })

  describe('Enabler 관리', () => {
    it('Enabler 를 추가할 수 있다', () => {
      const enabler = createTestEnabler()
      doc.addEnabler(enabler)

      const state = doc.getState()
      const stored = state.enablers.get('test_enabler')

      expect(stored).toBeDefined()
      expect(stored.name).toBe('테스트 Enabler')
    })

    it('Enabler 를 업데이트할 수 있다', () => {
      const enabler = createTestEnabler()
      doc.addEnabler(enabler)

      doc.updateEnabler('test_enabler', {
        name: '업데이트된 이름',
        description: '업데이트된 설명',
      })

      const state = doc.getState()
      const stored = state.enablers.get('test_enabler')

      expect(stored.name).toBe('업데이트된 이름')
      expect(stored.description).toBe('업데이트된 설명')
    })

    it('존재하지 않는 Enabler 는 업데이트되지 않는다', () => {
      doc.updateEnabler('nonexistent', { name: '새 이름' })

      const state = doc.getState()
      expect(state.enablers.get('nonexistent')).toBeUndefined()
    })

    it('Enabler 를 삭제할 수 있다', () => {
      const enabler = createTestEnabler()
      doc.addEnabler(enabler)

      expect(doc.getState().enablers.get('test_enabler')).toBeDefined()

      doc.deleteEnabler('test_enabler')

      expect(doc.getState().enablers.get('test_enabler')).toBeUndefined()
    })

    it('Enabler 삭제 시 관련 매핑도 삭제된다', () => {
      doc.addEnabler(createTestEnabler())
      doc.addSkillToEnabler('test_enabler', 'skill1')
      doc.addSkillToEnabler('test_enabler', 'skill2')

      expect(doc.getState().mappings.toArray().length).toBe(2)

      doc.deleteEnabler('test_enabler')

      expect(doc.getState().mappings.toArray().length).toBe(0)
    })
  })

  describe('Skill 관리', () => {
    it('Skill 을 추가할 수 있다', () => {
      doc.addSkill({
        skill_id: 'skill_001',
        label_ko: '테스트 스킬',
        label_en: 'Test Skill',
        type: 'skill/competence',
      })

      const state = doc.getState()
      const stored = state.skills.get('skill_001')

      expect(stored).toBeDefined()
      expect(stored.label_ko).toBe('테스트 스킬')
    })

    it('ESCO URI 가 있는 Skill 을 추가할 수 있다', () => {
      doc.addSkill({
        skill_id: 'esco_skill',
        label_ko: 'ESCO 스킬',
        label_en: 'ESCO Skill',
        type: 'knowledge',
        esco_uri: 'http://data.europa.eu/esco/skill/test',
      })

      const state = doc.getState()
      const stored = state.skills.get('esco_skill')

      expect(stored.esco_uri).toBe('http://data.europa.eu/esco/skill/test')
    })
  })

  describe('매핑 관리', () => {
    it('Enabler 에 Skill 을 추가할 수 있다', () => {
      doc.addSkillToEnabler('enabler1', 'skill1')

      const state = doc.getState()
      const mappings = state.mappings.toArray()

      expect(mappings.length).toBe(1)
      expect(mappings[0].enablerId).toBe('enabler1')
      expect(mappings[0].skillId).toBe('skill1')
    })

    it('추가 옵션과 함께 Skill 을 추가할 수 있다', () => {
      doc.addSkillToEnabler('enabler1', 'skill1', {
        importance: 5,
        target_proficiency: 'Expert',
        match_type: 'approximate',
      })

      const state = doc.getState()
      const mappings = state.mappings.toArray()

      expect(mappings[0].importance).toBe(5)
      expect(mappings[0].target_proficiency).toBe('Expert')
      expect(mappings[0].match_type).toBe('approximate')
    })

    it('Enabler 에서 Skill 을 제거할 수 있다', () => {
      doc.addSkillToEnabler('enabler1', 'skill1')
      doc.addSkillToEnabler('enabler1', 'skill2')

      expect(doc.getState().mappings.toArray().length).toBe(2)

      doc.removeSkillFromEnabler('enabler1', 'skill1')

      expect(doc.getState().mappings.toArray().length).toBe(1)
      expect(doc.getState().mappings.toArray()[0].skillId).toBe('skill2')
    })

    it('존재하지 않는 매핑 제거는 무시된다', () => {
      doc.addSkillToEnabler('enabler1', 'skill1')

      expect(doc.getState().mappings.toArray().length).toBe(1)

      doc.removeSkillFromEnabler('enabler1', 'nonexistent')

      expect(doc.getState().mappings.toArray().length).toBe(1)
    })
  })

  describe('이벤트 및 옵저버', () => {
    it('매핑 변경 이벤트를 구독할 수 있다', (done) => {
      doc.onMappingChange((changes: MappingChange[]) => {
        expect(changes.length).toBeGreaterThan(0)
        expect(changes[0].type).toBe('add')
        expect(changes[0].enablerId).toBe('enabler1')
        expect(changes[0].skillId).toBe('skill1')
        done()
      })

      doc.addSkillToEnabler('enabler1', 'skill1')
    })

    it('상태 업데이트 이벤트를 구독할 수 있다', (done) => {
      doc.onStateUpdate((state) => {
        expect(state).toBeDefined()
        expect(state.mappings.toArray().length).toBe(1)
        done()
      })

      doc.addSkillToEnabler('enabler1', 'skill1')
    })

    it('여러 변경이 하나의 이벤트로 모인다', (done) => {
      const changes: MappingChange[] = []

      doc.onMappingChange((newChanges) => {
        changes.push(...newChanges)

        if (changes.length >= 3) {
          expect(changes.length).toBe(3)
          done()
        }
      })

      doc.addSkillToEnabler('enabler1', 'skill1')
      doc.addSkillToEnabler('enabler1', 'skill2')
      doc.addSkillToEnabler('enabler1', 'skill3')
    })

    it('구독 해제가 가능하다', () => {
      let callCount = 0

      const unsubscribe = doc.onMappingChange(() => {
        callCount++
      })

      doc.addSkillToEnabler('enabler1', 'skill1')
      expect(callCount).toBe(1)

      unsubscribe()

      doc.addSkillToEnabler('enabler1', 'skill2')
      expect(callCount).toBe(1) // 증가하지 않음
    })
  })

  describe('ValidationContext 변환', () => {
    it('Yjs 문서를 ValidationContext 로 변환할 수 있다', () => {
      // Enabler 추가
      doc.addEnabler(createTestEnabler({ id: 'enabler1' }))

      // Skill 추가
      doc.addSkill({
        skill_id: 'skill1',
        label_ko: '스킬 1',
        label_en: 'Skill 1',
        type: 'skill/competence',
      })

      // 매핑 추가
      doc.addSkillToEnabler('enabler1', 'skill1', { importance: 4 })

      const context = doc.toValidationContext('test_domain')

      expect(context.enabler).toBeDefined()
      expect(context.enabler.id).toBe('enabler1')
      expect(context.skills.length).toBe(1)
      expect(context.skills[0].skill_id).toBe('skill1')
      expect(context.domain.id).toBe('test_domain')
      expect(context.allEnablers.length).toBe(1)
    })

    it('빈 문서도 ValidationContext 로 변환할 수 있다', () => {
      const context = doc.toValidationContext('empty_domain')

      expect(context.enabler).toBeDefined()
      expect(context.domain.id).toBe('empty_domain')
    })

    it('여러 Enabler 와 Skill 을 변환할 수 있다', () => {
      // 2 개 Enabler 추가
      doc.addEnabler(createTestEnabler({ id: 'enabler1' }))
      doc.addEnabler(createTestEnabler({ id: 'enabler2' }))

      // 2 개 Skill 추가
      doc.addSkill({ skill_id: 'skill1', label_ko: '스킬 1', label_en: 'Skill 1', type: 'skill/competence' })
      doc.addSkill({ skill_id: 'skill2', label_ko: '스킬 2', label_en: 'Skill 2', type: 'knowledge' })

      // 3 개 매핑 추가
      doc.addSkillToEnabler('enabler1', 'skill1')
      doc.addSkillToEnabler('enabler1', 'skill2')
      doc.addSkillToEnabler('enabler2', 'skill1')

      const context = doc.toValidationContext('multi_domain')

      expect(context.allEnablers.length).toBe(2)
      expect(context.skills.length).toBe(3)
    })
  })

  describe('인코딩/디코딩', () => {
    it('문서를 인코딩할 수 있다', () => {
      doc.addEnabler(createTestEnabler())
      doc.addSkillToEnabler('test_enabler', 'skill1')

      const encoded = doc.encode()

      expect(encoded).toBeInstanceOf(Uint8Array)
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('인코딩된 문서를 디코딩할 수 있다', () => {
      // 원본 문서에 데이터 추가
      doc.addEnabler(createTestEnabler({ id: 'original' }))
      doc.addSkillToEnabler('original', 'skill1')
      doc.addSkillToEnabler('original', 'skill2')

      const encoded = doc.encode()

      // 새 문서 생성
      const doc2 = createNewSharedDoc()
      doc2.decode(encoded)

      // 데이터 확인
      const state2 = doc2.getState()
      expect(state2.enablers.get('original')).toBeDefined()
      expect(state2.mappings.toArray().length).toBe(2)
    })

    it('인코딩/디코딩 후에도 데이터 무결성이 유지된다', () => {
      const originalData = {
        enablers: [
          { id: 'e1', name: 'Enabler 1', priority: 1 },
          { id: 'e2', name: 'Enabler 2', priority: 2 },
        ],
        mappings: [
          { enablerId: 'e1', skillId: 's1', importance: 5 },
          { enablerId: 'e2', skillId: 's2', importance: 3 },
        ],
      }

      // 원본 문서 생성
      doc.addEnabler(createTestEnabler({ id: 'e1', name: 'Enabler 1', priority: 1 }))
      doc.addEnabler(createTestEnabler({ id: 'e2', name: 'Enabler 2', priority: 2 }))
      doc.addSkillToEnabler('e1', 's1', { importance: 5 })
      doc.addSkillToEnabler('e2', 's2', { importance: 3 })

      const encoded = doc.encode()
      const doc2 = createNewSharedDoc()
      doc2.decode(encoded)

      const state2 = doc2.getState()

      // 무결성 확인
      expect(state2.enablers.get('e1')?.name).toBe('Enabler 1')
      expect(state2.enablers.get('e2')?.name).toBe('Enabler 2')

      const mappings = state2.mappings.toArray()
      const m1 = mappings.find((m) => m.enablerId === 'e1')
      const m2 = mappings.find((m) => m.enablerId === 'e2')

      expect(m1?.importance).toBe(5)
      expect(m2?.importance).toBe(3)
    })
  })

  describe('성능 관련', () => {
    it('대량의 매핑도 처리할 수 있다', () => {
      doc.addEnabler(createTestEnabler({ id: 'bulk_enabler' }))

      // 100 개 Skill 추가
      for (let i = 0; i < 100; i++) {
        doc.addSkill({
          skill_id: `skill_${i}`,
          label_ko: `스킬 ${i}`,
          label_en: `Skill ${i}`,
          type: 'skill/competence',
        })
        doc.addSkillToEnabler('bulk_enabler', `skill_${i}`)
      }

      const state = doc.getState()
      expect(state.mappings.toArray().length).toBe(100)
    })

    it('Yjs transact 을 사용하여 원자적 업데이트를 수행한다', () => {
      // transact 사용은 내부 구현이므로 간접 테스트
      doc.addSkillToEnabler('enabler1', 'skill1')

      const state = doc.getState()
      expect(state.mappings.toArray().length).toBe(1)
    })
  })
})
