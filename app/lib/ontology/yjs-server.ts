/**
 * Yjs WebSocket 서버 (개발용)
 * 프로덕션에서는 y-websocket 별도 서버 사용 권장
 *
 * usage:
 *   import { startYJSServer } from './yjs-server'
 *   startYJSServer(1234)
 */

import { WebSocketServer } from 'ws'
import * as Y from 'yjs'

interface YSocketClient {
  doc: Y.Doc
  clients: Set<any>
}

/**
 * 간단한 Yjs WebSocket 서버
 */
export class YJSServer {
  private wss: WebSocketServer | null = null
  private docs = new Map<string, YSocketClient>()
  private port: number

  constructor(port: number = 1234) {
    this.port = port
  }

  start(): void {
    this.wss = new WebSocketServer({ port: this.port })

    this.wss.on('connection', (ws) => {
      console.log(`[YJS] Client connected`)

      let roomName = 'default'

      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString())

          if (data.type === 'join') {
            roomName = data.room || 'default'
            this.handleJoin(ws, roomName)
          } else if (data.type === 'update') {
            this.handleUpdate(roomName, data.update)
          }
        } catch (error) {
          console.error('[YJS] Message error:', error)
        }
      })

      ws.on('close', () => {
        console.log(`[YJS] Client disconnected from ${roomName}`)
        this.handleLeave(roomName, ws)
      })

      ws.on('error', (error) => {
        console.error('[YJS] WebSocket error:', error)
      })
    })

    console.log(`[YJS] Server started on port ${this.port}`)
  }

  private handleJoin(ws: any, roomName: string): void {
    if (!this.docs.has(roomName)) {
      this.docs.set(roomName, {
        doc: new Y.Doc(),
        clients: new Set(),
      })
    }

    const room = this.docs.get(roomName)!
    room.clients.add(ws)

    // 현재 상태 전송
    const state = Y.encodeStateAsUpdate(room.doc)
    ws.send(
      JSON.stringify({
        type: 'init',
        room: roomName,
        state: Buffer.from(state).toString('base64'),
      })
    )

    console.log(`[YJS] Client joined ${roomName} (${room.clients.size} clients)`)
  }

  private handleLeave(roomName: string, ws: any): void {
    const room = this.docs.get(roomName)
    if (room) {
      room.clients.delete(ws)

      if (room.clients.size === 0) {
        // 마지막 클라이언트가 나가면 문서 유지 (데이터 보존)
        console.log(`[YJS] Room ${roomName} is empty but preserved`)
      }
    }
  }

  private handleUpdate(roomName: string, updateBase64: string): void {
    const room = this.docs.get(roomName)
    if (!room) return

    try {
      const update = new Uint8Array(Buffer.from(updateBase64, 'base64'))
      Y.applyUpdate(room.doc, update)

      // 다른 클라이언트들에게 브로드캐스트
      const newUpdate = Y.encodeStateAsUpdate(room.doc)
      room.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: 'update',
              room: roomName,
              update: Buffer.from(newUpdate).toString('base64'),
            })
          )
        }
      })
    } catch (error) {
      console.error('[YJS] Update error:', error)
    }
  }

  stop(): void {
    if (this.wss) {
      this.wss.close()
      console.log('[YJS] Server stopped')
    }
  }

  getDoc(roomName: string): Y.Doc | null {
    return this.docs.get(roomName)?.doc || null
  }
}

/**
 * 팩토리 함수
 */
export function startYJSServer(port: number = 1234): YJSServer {
  const server = new YJSServer(port)
  server.start()
  return server
}
