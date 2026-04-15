/**
 * Live DRC 서비스
 * 실시간 협업 편집 시 즉시 검증 수행
 * 하네스 엔지니어링 Phase 4: Live Collaborative DRC
 */

import { SharedOntologyDoc, type MappingChange } from '../ontology/shared-doc'
import { DRCEngine, createDRCEngine } from './drc-engine'
import type { ValidationResult } from './types'

/**
 * Live DRC 설정
 */
export interface LiveDRCConfig {
  /** Debounce 지연 시간 (ms) - 기본값 500 */
  debounceMs?: number
  /** 자동 시작 여부 - 기본값 true */
  autoStart?: boolean
  /** AI-DRC 사용 여부 - 기본값 false (성능 우선) */
  enableAI?: boolean
}

/**
 * Live DRC 상태
 */
export interface LiveDRCState {
  /** 실행 중 여부 */
  running: boolean
  /** 마지막 검증 시간 */
  lastValidationAt: Date | null
  /** 현재 검증 결과 */
  currentResults: ValidationResult[]
  /** 변경 이력 */
  changeHistory: MappingChange[]
  /** 로딩 중 여부 */
  validating: boolean
}

/**
 * Live DRC 서비스 클래스
 *
 * Yjs 문서 변경을 감지하여 자동으로 DRC 검증을 실행
 * - Debounce 를 통한 성능 최적화
 * - 규칙 기반 검증만 실행 (실시간 응답優先)
 * - 검증 결과 실시간 브로드캐스트
 */
export class LiveDRCService {
  private engine: DRCEngine
  private doc: SharedOntologyDoc
  private config: Required<LiveDRCConfig>

  private state: LiveDRCState = {
    running: false,
    lastValidationAt: null,
    currentResults: [],
    changeHistory: [],
    validating: false,
  }

  private debounceTimer: NodeJS.Timeout | null = null
  private validationCallbacks: ((results: ValidationResult[]) => void)[] = []
  private stateCallbacks: ((state: LiveDRCState) => void)[] = []

  /**
   * 생성자
   */
  constructor(
    doc: SharedOntologyDoc,
    config?: LiveDRCConfig
  ) {
    this.doc = doc
    this.engine = createDRCEngine()
    this.config = {
      debounceMs: config?.debounceMs ?? 500,
      autoStart: config?.autoStart ?? true,
      enableAI: config?.enableAI ?? false,
    }

    // 문서 변경 리스너 등록
    this.doc.onMappingChange(this.handleMappingChange)
    this.doc.onStateUpdate(this.handleStateUpdate)

    // 자동 시작
    if (this.config.autoStart) {
      this.start()
    }
  }

  /**
   * 매핑 변경 핸들러
   */
  private handleMappingChange = (changes: MappingChange[]): void => {
    // 변경 이력에 추가
    this.state.changeHistory.push(...changes)

    // Debounce 된 검증 트리거
    this.triggerDebouncedValidation()
  }

  /**
   * 상태 업데이트 핸들러
   */
  private handleStateUpdate = (): void => {
    this.notifyStateUpdate()
  }

  /**
   * Debounce 된 검증 트리거
   */
  private triggerDebouncedValidation(): void {
    if (!this.state.running) return

    // 기존 타이머 클리어
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // 새 타이머 설정
    this.debounceTimer = setTimeout(() => {
      this.executeValidation()
    }, this.config.debounceMs)
  }

  /**
   * 실제 검증 실행
   */
  private async executeValidation(): Promise<void> {
    if (this.state.validating) return

    this.setState({ validating: true })

    try {
      // Yjs 문서를 ValidationContext 로 변환
      const context = this.doc.toValidationContext('live')

      // 규칙 기반 DRC 실행 (AI 는 성능상 생략)
      const results = this.engine.validateEnabler(
        context.enabler,
        context.allEnablers,
        context.allSkills,
        context.domain
      )

      // 결과 업데이트
      this.setState({
        currentResults: results,
        lastValidationAt: new Date(),
        validating: false,
      })

      // 결과 브로드캐스트
      this.notifyValidationUpdate(results)
    } catch (error) {
      console.error('[LiveDRC] Validation error:', error)
      this.setState({ validating: false })
    }
  }

  /**
   * 상태 업데이트
   */
  private setState(partial: Partial<LiveDRCState>): void {
    this.state = { ...this.state, ...partial }
    this.notifyStateUpdate()
  }

  /**
   * 검증 결과 업데이트 알림
   */
  private notifyValidationUpdate(results: ValidationResult[]): void {
    this.validationCallbacks.forEach((cb) => cb(results))
  }

  /**
   * 상태 업데이트 알림
   */
  private notifyStateUpdate(): void {
    this.stateCallbacks.forEach((cb) => cb(this.state))
  }

  /**
   * 실시간 검증 시작
   */
  start(): void {
    if (this.state.running) return

    this.setState({ running: true })
    console.log('[LiveDRC] Started live validation')

    // 초기 검증 실행
    this.executeValidation()
  }

  /**
   * 실시간 검증 중지
   */
  stop(): void {
    this.setState({ running: false })

    // Debounce 타이머 클리어
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    console.log('[LiveDRC] Stopped live validation')
  }

  /**
   * 수동 검증 실행 (즉시)
   */
  forceValidate(): Promise<ValidationResult[]> {
    return new Promise((resolve) => {
      // Debounce 타이머 클리어
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
        this.debounceTimer = null
      }

      // 즉시 실행
      this.executeValidation().then(() => {
        resolve(this.state.currentResults)
      })
    })
  }

  /**
   * 검증 결과 구독
   */
  onValidationUpdate(callback: (results: ValidationResult[]) => void): () => void {
    this.validationCallbacks.push(callback)

    // 즉시 현재 결과도 전달
    if (this.state.currentResults.length > 0) {
      callback(this.state.currentResults)
    }

    // 구독 해제 함수 반환
    return () => {
      const index = this.validationCallbacks.indexOf(callback)
      if (index !== -1) {
        this.validationCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 상태 구독
   */
  onStateUpdate(callback: (state: LiveDRCState) => void): () => void {
    this.stateCallbacks.push(callback)

    // 즉시 현재 상태도 전달
    callback(this.state)

    // 구독 해제 함수 반환
    return () => {
      const index = this.stateCallbacks.indexOf(callback)
      if (index !== -1) {
        this.stateCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 현재 상태 반환
   */
  getState(): LiveDRCState {
    return { ...this.state }
  }

  /**
   * 변경 이력 반환
   */
  getChangeHistory(): MappingChange[] {
    return [...this.state.changeHistory]
  }

  /**
   * 변경 이력 초기화
   */
  clearChangeHistory(): void {
    this.state.changeHistory = []
    this.notifyStateUpdate()
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<LiveDRCConfig>): void {
    if (config.debounceMs !== undefined) {
      this.config.debounceMs = config.debounceMs
    }
    if (config.enableAI !== undefined) {
      this.config.enableAI = config.enableAI
    }
    console.log('[LiveDRC] Config updated:', this.config)
  }

  /**
   * 정리 (리소스 해제)
   */
  dispose(): void {
    this.stop()
    this.validationCallbacks = []
    this.stateCallbacks = []
    console.log('[LiveDRC] Disposed')
  }
}

/**
 * Live DRC 서비스 생성 팩토리
 */
export function createLiveDRCService(
  doc: SharedOntologyDoc,
  config?: LiveDRCConfig
): LiveDRCService {
  return new LiveDRCService(doc, config)
}
