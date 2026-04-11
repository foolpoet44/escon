'use client'

/**
 * ChatWidget.tsx
 *
 * ESCON 페이지 어디에나 붙일 수 있는 챗 위젯.
 *
 * 사용법:
 *   import { ChatWidget } from '@/components/ChatWidget'
 *   <ChatWidget userId="user-123" />
 */

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWidgetProps {
  userId?: string
  placeholder?: string
}

export function ChatWidget({
  userId = 'anonymous',
  placeholder = '스킬 성장에 대해 무엇이든 물어보세요...',
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 새 메시지마다 스크롤 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isLoading) return

    // 사용자 메시지 즉시 표시
    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // 어시스턴트 메시지 자리 미리 만들기 (스트리밍용)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userId }),
      })

      if (!res.ok || !res.body) {
        throw new Error('API 오류')
      }

      // 스트리밍 텍스트 읽기
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            }
          }
          return updated
        })
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '오류가 발생했습니다. 다시 시도해 주세요.',
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '500px',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
      fontSize: '14px',
    }}>

      {/* 헤더 */}
      <div style={{
        padding: '12px 16px',
        background: '#1e293b',
        color: '#f8fafc',
        fontWeight: 600,
        fontSize: '13px',
        letterSpacing: '0.02em',
      }}>
        ESCON — 스킬 성장 코치
      </div>

      {/* 메시지 목록 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#f8fafc',
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#94a3b8',
            marginTop: '40px',
            lineHeight: 1.6,
          }}>
            안녕하세요.<br />
            스킬 갭 분석, 학습 경로 추천 등<br />
            성장에 대해 무엇이든 물어보세요.
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '75%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user'
                ? '12px 12px 2px 12px'
                : '12px 12px 12px 2px',
              background: msg.role === 'user' ? '#1e293b' : '#ffffff',
              color: msg.role === 'user' ? '#f8fafc' : '#1e293b',
              border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
              {/* 스트리밍 커서 */}
              {msg.role === 'assistant' && isLoading && i === messages.length - 1 && (
                <span style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '14px',
                  background: '#64748b',
                  marginLeft: '2px',
                  verticalAlign: 'middle',
                  animation: 'blink 1s step-end infinite',
                }}/>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px',
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit',
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '8px 16px',
            background: isLoading || !input.trim() ? '#94a3b8' : '#1e293b',
            color: '#f8fafc',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          {isLoading ? '...' : '전송'}
        </button>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
