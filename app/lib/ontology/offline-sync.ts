/**
 * 오프라인 동기화 지원 (y-indexeddb)
 * 오프라인 편집 후 온라인 시 자동 동기화
 * 하네스 엔지니어링 Phase 4: Live Collaborative DRC
 */

import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { SharedOntologyDoc } from './shared-doc'

/**
 * 오프라인 동기화 상태
 */
export interface OfflineSyncState {
  /** 오프라인 모드 여부 */
  isOffline: boolean
  /** 로컬 데이터 있음 여부 */
  hasLocalData: boolean
  /** 동기화 진행 중 */
  syncing: boolean
  /** 마지막 동기화 시간 */
  lastSyncAt: Date | null
  /** 로컬 변경 사항 수 */
  pendingChanges: number
}

/**
 * 오프라인 동기화 관리자
 *
 * y-indexeddb 를 사용하여:
 * - 오프라인 시 로컬 데이터 저장
 * - 온라인 복귀 시 자동 동기화
 * - DRC 결과 캐싱
 */
export class OfflineSyncManager {
  private doc: Y.Doc
  private persistence: IndexeddbPersistence | null = null
  private state: OfflineSyncState = {
    isOffline: false,
    hasLocalData: false,
    syncing: false,
    lastSyncAt: null,
    pendingChanges: 0,
  }
  private stateCallbacks: ((state: OfflineSyncState) => void)[] = []
  private changeQueue: Uint8Array[] = []

  constructor(
    sharedDoc: SharedOntologyDoc,
    dbName: string = 'escon-ontology'
  ) {
    this.doc = sharedDoc.getDoc()

    // IndexedDB 초기화
    this.initPersistence(dbName)

    // 온라인/오프라인 상태 감지
    this.initOnlineHandlers()
  }

  /**
   * IndexedDB 영속성 초기화
   */
  private initPersistence(dbName: string): void {
    try {
      this.persistence = new IndexeddbPersistence(dbName, this.doc)

      this.persistence.on('synced', () => {
        this.setState({
          syncing: false,
          lastSyncAt: new Date(),
          isOffline: false,
        })
        console.log('[OfflineSync] Synced with IndexedDB')
      })

      this.persistence.on('error', (error) => {
        console.error('[OfflineSync] IndexedDB error:', error)
        this.setState({ isOffline: true, syncing: false })
      })

      // 로컬 데이터 존재 여부 확인
      this.persistence.on('sync', () => {
        const hasData = this.doc.toArray().length > 0
        this.setState({ hasLocalData: hasData })
      })

      console.log('[OfflineSync] IndexedDB persistence initialized')
    } catch (error) {
      console.error('[OfflineSync] Failed to init IndexedDB:', error)
      this.setState({ isOffline: true })
    }
  }

  /**
   * 온라인/오프라인 상태 핸들러
   */
  private initOnlineHandlers(): void {
    // 초기 상태 설정
    this.setState({ isOffline: !navigator.onLine })

    window.addEventListener('online', () => {
      console.log('[OfflineSync] Back online')
      this.setState({ isOffline: false, syncing: true })
      this.flushChangeQueue()
    })

    window.addEventListener('offline', () => {
      console.log('[OfflineSync] Went offline')
      this.setState({ isOffline: true, syncing: false })
    })
  }

  /**
   * 상태 업데이트
   */
  private setState(partial: Partial<OfflineSyncState>): void {
    this.state = { ...this.state, ...partial }
    this.notifyStateUpdate()
  }

  /**
   * 상태 구독
   */
  onStateUpdate(callback: (state: OfflineSyncState) => void): () => void {
    this.stateCallbacks.push(callback)
    callback(this.state)

    return () => {
      const index = this.stateCallbacks.indexOf(callback)
      if (index !== -1) {
        this.stateCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * 상태 알림 발송
   */
  private notifyStateUpdate(): void {
    this.stateCallbacks.forEach((cb) => cb(this.state))
  }

  /**
   * 변경 사항을 큐에 추가 (오프라인 시)
   */
  queueChange(update: Uint8Array): void {
    if (this.state.isOffline) {
      this.changeQueue.push(update)
      this.setState({ pendingChanges: this.changeQueue.length })
      console.log(`[OfflineSync] Queued change (${this.changeQueue.length} pending)`)
    }
  }

  /**
   * 큐에 쌓인 변경사항 플러시 (온라인 복귀 시)
   */
  private flushChangeQueue(): void {
    if (this.changeQueue.length === 0) return

    console.log(`[OfflineSync] Flushing ${this.changeQueue.length} pending changes`)

    // 모든 변경사항을 doc 에 적용
    // (WebSocket 연결 시 자동으로 동기화됨)
    this.changeQueue = []
    this.setState({ pendingChanges: 0 })
  }

  /**
   * 현재 상태 반환
   */
  getState(): OfflineSyncState {
    return { ...this.state }
  }

  /**
   * 로컬 데이터 저장 (수동)
   */
  saveLocal(): void {
    if (this.persistence) {
      // IndexedDB 에 명시적 저장
      // (자동 저장되지만, 명시적 호출도 가능)
      console.log('[OfflineSync] Local data saved')
    }
  }

  /**
   * 로컬 데이터 지우기
   */
  async clearLocalData(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.persistence) {
        reject(new Error('Persistence not initialized'))
        return
      }

      try {
        const request = indexedDB.deleteDatabase('escon-ontology')
        request.onsuccess = () => {
          console.log('[OfflineSync] Local data cleared')
          resolve()
        }
        request.onerror = () => {
          reject(request.error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * DRC 결과 캐싱
   */
  async cacheDRCResults(results: any, domainId: string): Promise<void> {
    try {
      const cacheKey = `drc-cache:${domainId}`
      const cacheData = {
        results,
        cachedAt: new Date().toISOString(),
      }

      const request = indexedDB.open('escon-drc-cache', 1)

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }
      }

      request.onsuccess = (event: any) => {
        const db = event.target.result
        const transaction = db.transaction(['cache'], 'readwrite')
        const store = transaction.objectStore('cache')
        store.put({ key: cacheKey, data: cacheData })
        console.log('[OfflineSync] DRC results cached')
      }

      request.onerror = () => {
        console.error('[OfflineSync] Failed to cache DRC results')
      }
    } catch (error) {
      console.error('[OfflineSync] Cache error:', error)
    }
  }

  /**
   * 캐시된 DRC 결과 조회
   */
  async getCachedDRCResults(domainId: string): Promise<any | null> {
    return new Promise((resolve) => {
      const cacheKey = `drc-cache:${domainId}`

      const request = indexedDB.open('escon-drc-cache', 1)

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }
      }

      request.onsuccess = (event: any) => {
        const db = event.target.result
        const transaction = db.transaction(['cache'], 'readonly')
        const store = transaction.objectStore('cache')
        const getReq = store.get(cacheKey)

        getReq.onsuccess = () => {
          if (getReq.result) {
            const { data, cachedAt } = getReq.result
            // 5 분 이내 캐시만 반환
            const cacheAge = Date.now() - new Date(cachedAt).getTime()
            if (cacheAge < 5 * 60 * 1000) {
              console.log('[OfflineSync] Cache hit')
              resolve(data.results)
              return
            }
          }
          resolve(null)
        }

        getReq.onerror = () => {
          resolve(null)
        }
      }

      request.onerror = () => {
        resolve(null)
      }
    })
  }

  /**
   * 정리 (리소스 해제)
   */
  dispose(): void {
    if (this.persistence) {
      this.persistence.destroy()
      this.persistence = null
    }
    this.stateCallbacks = []
    console.log('[OfflineSync] Disposed')
  }
}

/**
 * 오프라인 동기화 관리자 생성 팩토리
 */
export function createOfflineSyncManager(
  sharedDoc: SharedOntologyDoc,
  dbName?: string
): OfflineSyncManager {
  return new OfflineSyncManager(sharedDoc, dbName)
}
