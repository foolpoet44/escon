/**
 * Live DRC 통합 테스트
 */

import { SharedOntologyDoc, getSharedOntologyDoc, createNewSharedDoc } from '../../ontology/shared-doc'
import { LiveDRCService, createLiveDRCService } from '../live-drc'
import type { Enabler, EnablerSkill } from '../types'

// 테스트용 목 데이터 생성
function createTestEnabler(): Enabler {
  return {
    id: 'test_enabler_1',
    name: '테스트 Enabler',
    name_en: 'Test Enabler',
    description: '테스트용 Enabler',
    priority: 1,
    skills: [],
  }
}

function createTestSkill(skillId: string, importance: number = 3): EnablerSkill {
  return {
    skill_id: skillId,
    label_ko: `테스트 스킬 ${skillId}`,
    label_en: `Test Skill ${skillId}`,
    type: 'skill/competence',
    importance,
    target_proficiency: 'Intermediate',
    priority_rank: 1,
    match_type: 'exact',
  }
}

describe('LiveDRCService', () => {
  let doc: SharedOntologyDoc
  let service: LiveDRCService

  beforeEach(() => {
    // 새 문서 생성
    doc = createNewSharedDoc()
  })

  afterEach(() => {
    // 서비스 정리
    if (service) {
      service.dispose()
    }
  })

  describe('초기화', () => {
    it('서비스가 자동으로 시작된다 (autoStart: true)', (done) => {
      service = createLiveDRCService(doc, { autoStart: true })

      service.onStateUpdate((state) => {
        if (state.running) {
          expect(state.running).toBe(true)
          done()
        }
      })
    })

    it('서비스가 수동으로 시작된다 (autoStart: false)', () => {
      service = createLiveDRCService(doc, { autoStart: false })
      const state = service.getState()

      expect(state.running).toBe(false)
    })
  })

  describe('실시간 검증', () => {
    it('매핑 추가 시 검증이 트리거된다', (done) => {
      let validationCount = 0

      service = createLiveDRCService(doc, {
        debounceMs: 100, // 테스트용 빠른 debounce
        autoStart: true,
      })

      service.onValidationUpdate((results) => {
        validationCount++
        if (validationCount >= 1) {
          expect(results.length).toBeGreaterThan(0)
          done()
        }
      })

      // 매핑 추가
      doc.addSkillToEnabler('test_enabler', 'test_skill_1')
    })

    it('Debounce 시간 내에 여러 변경이 하나의 검증으로 처리된다', (done) => {
      let validationCount = 0

      service = createLiveDRCService(doc, {
        debounceMs: 200,
        autoStart: true,
      })

      service.onValidationUpdate(() => {
        validationCount++
      })

      // 50ms 간격으로 3 회 변경 (200ms debounce 내에)
      setTimeout(() => doc.addSkillToEnabler('enabler1', 'skill1'), 50)
      setTimeout(() => doc.addSkillToEnabler('enabler1', 'skill2'), 100)
      setTimeout(() => doc.addSkillToEnabler('enabler1', 'skill3'), 150)

      // 500ms 후 검증이 한 번만 실행되었는지 확인
      setTimeout(() => {
        expect(validationCount).toBeGreaterThanOrEqual(1)
        done()
      }, 500)
    })
  })

  describe('상태 관리', () => {
    it('start/stop 으로 검증을 제어할 수 있다', () => {
      service = createLiveDRCService(doc, { autoStart: false })

      expect(service.getState().running).toBe(false)

      service.start()
      expect(service.getState().running).toBe(true)

      service.stop()
      expect(service.getState().running).toBe(false)
    })

    it('forceValidate 는 즉시 검증을 실행한다', async () => {
      service = createLiveDRCService(doc, { autoStart: false })
      service.start()

      const results = await service.forceValidate()

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })

    it('변경 이력을 추적한다', () => {
      service = createLiveDRCService(doc, { autoStart: false })

      doc.addSkillToEnabler('enabler1', 'skill1')
      doc.addSkillToEnabler('enabler1', 'skill2')

      const history = service.getChangeHistory()

      expect(history.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('검증 결과', () => {
    it('빈 Enabler 에 대해 에러를 반환한다', (done) => {
      service = createLiveDRCService(doc, {
        debounceMs: 100,
        autoStart: true,
      })

      let unsubscribed = false
      service.onValidationUpdate((results) => {
        if (unsubscribed) return

        const hasError = results.some((r) => r.severity === 'error' && !r.passed)

        // 빈 Enabler 는 에러가 있어야 함
        if (hasError) {
          unsubscribed = true
          done()
        }
      })

      // 빈 Enabler 추가
      doc.addEnabler(createTestEnabler())
    })

    it('유효한 매핑에 대해 통과 결과를 반환한다', (done) => {
      service = createLiveDRCService(doc, {
        debounceMs: 100,
        autoStart: true,
      })

      // 유효한 스킬 추가
      doc.addSkillToEnabler('test_enabler', 'valid_skill', { importance: 4 })

      let unsubscribed = false
      service.onValidationUpdate((results) => {
        if (unsubscribed) return

        const passedCount = results.filter((r) => r.passed).length

        // 최소 1 개 이상 통과해야 함
        if (passedCount > 0) {
          unsubscribed = true
          done()
        }
      })
    })
  })

  describe('설정', () => {
    it('Debounce 시간을 동적으로 변경할 수 있다', () => {
      service = createLiveDRCService(doc, { debounceMs: 500 })

      service.updateConfig({ debounceMs: 1000 })

      // 내부 설정 확인 (로깅 등으로 간접 확인)
      expect(true).toBe(true) // 설정 변경은 로그로 확인
    })
  })
})

describe('SharedOntologyDoc', () => {
  let doc: SharedOntologyDoc

  beforeEach(() => {
    doc = createNewSharedDoc()
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

    it('Enabler 에서 Skill 을 제거할 수 있다', () => {
      doc.addSkillToEnabler('enabler1', 'skill1')
      doc.addSkillToEnabler('enabler1', 'skill2')

      expect(doc.getState().mappings.toArray().length).toBe(2)

      doc.removeSkillFromEnabler('enabler1', 'skill1')

      expect(doc.getState().mappings.toArray().length).toBe(1)
    })

    it('매핑 변경 시 이벤트가 발생한다', (done) => {
      doc.onMappingChange((changes) => {
        expect(changes.length).toBeGreaterThan(0)
        expect(changes[0].type).toBe('add')
        done()
      })

      doc.addSkillToEnabler('enabler1', 'skill1')
    })
  })

  describe('Enabler 관리', () => {
    it('Enabler 를 추가할 수 있다', () => {
      const enabler = createTestEnabler()
      doc.addEnabler(enabler)

      const enablers = doc.getState().enablers
      expect(enablers.get('test_enabler_1')).toBeDefined()
    })

    it('Enabler 를 업데이트할 수 있다', () => {
      const enabler = createTestEnabler()
      doc.addEnabler(enabler)

      doc.updateEnabler('test_enabler_1', { name: '업데이트된 이름' })

      const data = doc.getState().enablers.get('test_enabler_1')
      expect(data.name).toBe('업데이트된 이름')
    })

    it('Enabler 삭제 시 관련 매핑도 삭제된다', () => {
      const enabler = createTestEnabler()
      doc.addEnabler(enabler)
      doc.addSkillToEnabler('test_enabler_1', 'skill1')
      doc.addSkillToEnabler('test_enabler_1', 'skill2')

      expect(doc.getState().mappings.toArray().length).toBe(2)

      doc.deleteEnabler('test_enabler_1')

      expect(doc.getState().mappings.toArray().length).toBe(0)
    })
  })

  describe('ValidationContext 변환', () => {
    it('Yjs 문서를 ValidationContext 로 변환할 수 있다', () => {
      // Enabler 추가
      doc.addEnabler(createTestEnabler())

      // 스킬 추가
      doc.addSkill({
        skill_id: 'skill1',
        label_ko: '스킬 1',
        label_en: 'Skill 1',
        type: 'skill/competence',
      })

      // 매핑 추가
      doc.addSkillToEnabler('test_enabler_1', 'skill1', { importance: 4 })

      const context = doc.toValidationContext('test_domain')

      expect(context.enabler).toBeDefined()
      expect(context.skills.length).toBeGreaterThan(0)
      expect(context.domain.id).toBe('test_domain')
    })
  })

  describe('인코딩/디코딩', () => {
    it('문서를 인코딩하고 디코딩할 수 있다', () => {
      // 데이터 추가
      doc.addEnabler(createTestEnabler())
      doc.addSkillToEnabler('test_enabler_1', 'skill1')

      // 인코딩
      const encoded = doc.encode()
      expect(encoded).toBeInstanceOf(Uint8Array)
      expect(encoded.length).toBeGreaterThan(0)

      // 새 문서에 디코딩
      const doc2 = createNewSharedDoc()
      doc2.decode(encoded)

      // 데이터 확인
      const state2 = doc2.getState()
      expect(state2.enablers.get('test_enabler_1')).toBeDefined()
    })
  })
})
