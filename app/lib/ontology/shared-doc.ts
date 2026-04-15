/**
 * Yjs 기반 공유 온톨로지 문서
 * 실시간 협업 편집을 위한 CRDT 문서 모델
 * 하네스 엔지니어링 Phase 4: Live DRC
 */

import * as Y from 'yjs'
import type { Enabler, EnablerSkill, Domain } from '../validation/types'

/**
 * 매핑 변경 이벤트
 */
export interface MappingChange {
  type: 'add' | 'remove' | 'update'
  enablerId: string
  skillId: string
  timestamp: number
}

/**
 * 온톨로지 문서 상태
 */
export interface OntologyState {
  enablers: Map<string, any>
  skills: Map<string, any>
  mappings: Array<any>
}

/**
 * 공유 온톨로지 문서 클래스
 *
 * Yjs CRDT 를 사용하여 여러 사용자가 동시에 온톨로지를 편집할 수 있음
 * - Enabler 추가/수정/삭제
 * - Skill 추가/수정/삭제
 * - Enabler-Skill 매핑 변경
 */
export class SharedOntologyDoc {
  private ydoc: Y.Doc
  private enablersMap: Y.Map<any>
  private skillsMap: Y.Map<any>
  private mappingsArray: Y.Array<any>
  private metadataMap: Y.Map<any>

  private changeCallbacks: ((changes: MappingChange[]) => void)[] = []
  private stateCallbacks: ((state: OntologyState) => void)[] = []

  constructor() {
    this.ydoc = new Y.Doc()

    // Yjs 데이터 구조 초기화
    this.enablersMap = this.ydoc.getMap('enablers')
    this.skillsMap = this.ydoc.getMap('skills')
    this.mappingsArray = this.ydoc.getArray('mappings')
    this.metadataMap = this.ydoc.getMap('metadata')

    // 초기 메타데이터 설정
    if (!this.metadataMap.has('createdAt')) {
      this.metadataMap.set('createdAt', new Date().toISOString())
      this.metadataMap.set('version', '1.0')
    }

    // 변경 감지 리스너 설정
    this.setupObservers()
  }

  /**
   * Yjs 문서 observers 설정
   */
  private setupObservers(): void {
    // mappings 배열 변경 감지
    this.mappingsArray.observe((event) => {
      const changes: MappingChange[] = []

      event.changes.delta.forEach((delta) => {
        if (delta.insert) {
          const inserted = Array.isArray(delta.insert) ? delta.insert : [delta.insert]
          inserted.forEach((item: any) => {
            if (item && typeof item === 'object') {
              changes.push({
                type: 'add',
                enablerId: item.enablerId,
                skillId: item.skillId,
                timestamp: Date.now(),
              })
            }
          })
        }
        if (delta.delete) {
          // 삭제된 항목은 추가 정보 필요 (현재는 단순화)
          changes.push({
            type: 'remove',
            enablerId: 'unknown',
            skillId: 'unknown',
            timestamp: Date.now(),
          })
        }
      })

      if (changes.length > 0) {
        this.notifyChange(changes)
      }
    })

    // enablers 맵 변경 감지
    this.enablersMap.observe((event) => {
      const changes: MappingChange[] = []
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          changes.push({
            type: change.action === 'add' ? 'add' : 'update',
            enablerId: key,
            skillId: '',
            timestamp: Date.now(),
          })
        }
      })
      if (changes.length > 0) {
        this.notifyChange(changes)
      }
    })
  }

  /**
   * 변경 콜백 등록
   */
  onMappingChange(callback: (changes: MappingChange[]) => void): () => void {
    this.changeCallbacks.push(callback)

    return () => {
      const index = this.changeCallbacks.indexOf(callback)
      if (index !== -1) {
        this.changeCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 상태 업데이트 콜백 등록
   */
  onStateUpdate(callback: (state: OntologyState) => void): () => void {
    this.stateCallbacks.push(callback)

    return () => {
      const index = this.stateCallbacks.indexOf(callback)
      if (index !== -1) {
        this.stateCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 변경 알림 발송
   */
  private notifyChange(changes: MappingChange[]): void {
    this.changeCallbacks.forEach((cb) => cb(changes))
    this.notifyStateUpdate()
  }

  /**
   * 상태 업데이트 알림 발송
   */
  private notifyStateUpdate(): void {
    const state = this.getState()
    this.stateCallbacks.forEach((cb) => cb(state))
  }

  /**
   * 현재 상태 반환
   */
  getState(): OntologyState {
    return {
      enablers: this.enablersMap,
      skills: this.skillsMap,
      mappings: this.mappingsArray,
    }
  }

  /**
   * Yjs 문서 반환 (WebSocket 연결용)
   */
  getDoc(): Y.Doc {
    return this.ydoc
  }

  /**
   * Enabler 에 Skill 추가
   */
  addSkillToEnabler(enablerId: string, skillId: string, skillData?: Partial<EnablerSkill>): void {
    this.ydoc.transact(() => {
      const mapping = {
        enablerId,
        skillId,
        importance: skillData?.importance || 3,
        target_proficiency: skillData?.target_proficiency || 'Intermediate',
        match_type: skillData?.match_type || 'exact',
        createdAt: new Date().toISOString(),
      }
      this.mappingsArray.push([mapping])
    })
  }

  /**
   * Enabler 에서 Skill 제거
   */
  removeSkillFromEnabler(enablerId: string, skillId: string): void {
    this.ydoc.transact(() => {
      const mappings = this.mappingsArray.toArray()
      const index = mappings.findIndex(
        (m: any) => m.enablerId === enablerId && m.skillId === skillId
      )
      if (index !== -1) {
        this.mappingsArray.delete(index)
      }
    })
  }

  /**
   * Enabler 추가
   */
  addEnabler(enabler: Enabler): void {
    this.enablersMap.set(enabler.id, {
      id: enabler.id,
      name: enabler.name,
      name_en: enabler.name_en,
      description: enabler.description,
      priority: enabler.priority,
      createdAt: new Date().toISOString(),
    })
  }

  /**
   * Enabler 업데이트
   */
  updateEnabler(enablerId: string, data: Partial<Enabler>): void {
    const current = this.enablersMap.get(enablerId)
    if (current) {
      this.enablersMap.set(enablerId, {
        ...current,
        ...data,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  /**
   * Enabler 삭제
   */
  deleteEnabler(enablerId: string): void {
    this.enablersMap.delete(enablerId)

    // 관련 매핑도 삭제
    this.ydoc.transact(() => {
      const mappings = this.mappingsArray.toArray()
      const indicesToRemove: number[] = []
      mappings.forEach((m: any, index: number) => {
        if (m.enablerId === enablerId) {
          indicesToRemove.push(index)
        }
      })
      // 역순으로 삭제 (인덱스 문제 방지)
      for (let i = indicesToRemove.length - 1; i >= 0; i--) {
        this.mappingsArray.delete(indicesToRemove[i])
      }
    })
  }

  /**
   * Skill 추가
   */
  addSkill(skill: any): void {
    this.skillsMap.set(skill.skill_id, {
      skill_id: skill.skill_id,
      label_ko: skill.label_ko || skill.preferred_label_ko,
      label_en: skill.label_en || skill.preferred_label_en,
      type: skill.type || skill.skill_type,
      esco_uri: skill.esco_uri,
      createdAt: new Date().toISOString(),
    })
  }

  /**
   * ValidationContext 로 변환
   */
  toValidationContext(domainId: string): any {
    const enablers: Enabler[] = []
    const skills: EnablerSkill[] = []

    // Enablers 복원
    this.enablersMap.forEach((value, key) => {
      enablers.push({
        id: value.id,
        name: value.name,
        name_en: value.name_en,
        description: value.description,
        priority: value.priority,
        skills: [], // 매핑에서 추출
      })
    })

    // 매핑에서 스킬 추출
    this.mappingsArray.forEach((mapping: any) => {
      const skill = this.skillsMap.get(mapping.skillId)
      if (skill) {
        skills.push({
          skill_id: mapping.skillId,
          label_ko: skill.label_ko,
          label_en: skill.label_en,
          type: skill.type,
          importance: mapping.importance,
          target_proficiency: mapping.target_proficiency,
          match_type: mapping.match_type,
          priority_rank: 0,
        })

        // Enabler 에 스킬 추가
        const enabler = enablers.find((e) => e.id === mapping.enablerId)
        if (enabler) {
          enabler.skills.push({
            skill_id: mapping.skillId,
            label_ko: skill.label_ko,
            label_en: skill.label_en,
            type: skill.type,
            importance: mapping.importance,
            target_proficiency: mapping.target_proficiency,
            match_type: mapping.match_type,
            priority_rank: 0,
          })
        }
      }
    })

    return {
      enabler: enablers[0] || { id: 'temp', name: 'Temp', name_en: '', description: '', priority: 0, skills: [] },
      skills,
      domain: { id: domainId, name: '', name_en: '', description: '', enablers },
      allEnablers: enablers,
      allSkills: [],
    }
  }

  /**
   * 인코딩 (전송용)
   */
  encode(): Uint8Array {
    return Y.encodeStateAsUpdate(this.ydoc)
  }

  /**
   * 디코딩 (수신용)
   */
  decode(update: Uint8Array): void {
    Y.applyUpdate(this.ydoc, update)
  }
}

/**
 * 싱글톤 인스턴스
 */
let _sharedDoc: SharedOntologyDoc | null = null

export function getSharedOntologyDoc(): SharedOntologyDoc {
  if (!_sharedDoc) {
    _sharedDoc = new SharedOntologyDoc()
  }
  return _sharedDoc
}

/**
 * 새 문서 생성 (초기화)
 */
export function createNewSharedDoc(): SharedOntologyDoc {
  _sharedDoc = new SharedOntologyDoc()
  return _sharedDoc
}
