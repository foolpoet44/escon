/**
 * Yjs WebSocket 클라이언트 (브라우저용)
 * SharedOntologyDoc 와 연동하여 실시간 협업 지원
 */

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import type { SharedOntologyDoc } from './shared-doc'

/**
 * Yjs WebSocket 연결 설정
 */
export interface YJSConnectionConfig {
  /** WebSocket 서버 URL - 기본값 'ws://localhost:1234' */
  serverUrl?: string
  /** 방 이름 - 기본값 'escon-ontology' */
  roomName?: string
  /** 자동 연결 - 기본값 true */
  autoConnect?: boolean
}

/**
 * Yjs 연결 상태
 */
export interface YJSConnectionState {
  connected: boolean
  connecting: boolean
  peers: number
  lastSyncAt: Date | null
}

/**
 * Yjs WebSocket 클라이언트
 */
export class YJSClient {
  private doc: Y.Doc
  private provider: WebsocketProvider | null = null
  private config: Required<YJSConnectionConfig>
  private state: YJSConnectionState = {
    connected: false,
    connecting: false,
    peers: 0,
    lastSyncAt: null,
  }
  private stateCallbacks: ((state: YJSConnectionState) => void)[] = []

  constructor(
    sharedDoc: SharedOntologyDoc,
    config?: YJSConnectionConfig
  ) {
    this.doc = sharedDoc.getDoc()
    this.config = {
      serverUrl: config?.serverUrl ?? 'ws://localhost:1234',
      roomName: config?.roomName ?? 'escon-ontology',
      autoConnect: config?.autoConnect ?? true,
    }

    if (this.config.autoConnect) {
      this.connect()
    }
  }

  /**
   * WebSocket 연결
   */
  connect(): void {
    if (this.provider) return

    this.setState({ connecting: true })

    try {
      this.provider = new WebsocketProvider(
        this.config.serverUrl,
        this.config.roomName,
        this.doc
      )

      this.provider.on('status', (event: { status: string }) => {
        this.setState({
          connected: event.status === 'connected',
          connecting: event.status === 'connecting',
        })
      })

      this.provider.on('peers', (peers: Map<string, any>) => {
        this.setState({ peers: peers.size })
      })

      this.provider.on('synced', () => {
        this.setState({ lastSyncAt: new Date() })
      })

      console.log('[YJS] Connected to', this.config.serverUrl)
    } catch (error) {
      console.error('[YJS] Connection failed:', error)
      this.setState({ connecting: false, connected: false })
    }
  }

  /**
   * 연결 해제
   */
  disconnect(): void {
    if (this.provider) {
      this.provider.destroy()
      this.provider = null
      this.setState({
        connected: false,
        connecting: false,
        peers: 0,
      })
      console.log('[YJS] Disconnected')
    }
  }

  /**
   * 상태 업데이트
   */
  private setState(partial: Partial<YJSConnectionState>): void {
    this.state = { ...this.state, ...partial }
    this.notifyStateUpdate()
  }

  /**
   * 상태 구독
   */
  onStateUpdate(callback: (state: YJSConnectionState) => void): () => void {
    this.stateCallbacks.push(callback)

    // 즉시 현재 상태도 전달
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
   * 현재 상태 반환
   */
  getState(): YJSConnectionState {
    return { ...this.state }
  }

  /**
   * Yjs 문서 반환
   */
  getDoc(): Y.Doc {
    return this.doc
  }

  /**
   * 인코딩 (전송용)
   */
  encode(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc)
  }

  /**
   * 디코딩 (수신용)
   */
  decode(update: Uint8Array): void {
    Y.applyUpdate(this.doc, update)
  }
}

/**
 * Yjs 클라이언트 생성 팩토리
 */
export function createYJSClient(
  sharedDoc: SharedOntologyDoc,
  config?: YJSConnectionConfig
): YJSClient {
  return new YJSClient(sharedDoc, config)
}
