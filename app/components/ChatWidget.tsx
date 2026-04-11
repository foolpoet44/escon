'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWidgetProps {
  userId?: string
  placeholder?: string
  targetEnablerId?: string
}

export function ChatWidget({
  userId = 'anonymous',
  placeholder = '스킬 성장에 대해 무엇이든 물어보세요...',
  targetEnablerId
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    // assistant의 메시지 공간 미리 확보
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      // 서버로 보낼 전체 대화 맥락 (현재 입력 포함)
      const conversationHistory = [...messages, userMessage];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory, userId, targetEnablerId }),
      })

      if (!res.ok || !res.body) throw new Error('API 오류가 발생했습니다.')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chunk }
          }
          return updated
        })
      }
    } catch (err) {
      console.error('[ChatWidget] 전송 오류:', err)
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.role === 'assistant') {
            updated[updated.length - 1] = {
              role: 'assistant',
              content: '오류가 발생했습니다. .env.local 설정(GEMINI_API_KEY)을 확인하거나 나중에 다시 시도해 주세요.',
            }
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
    <div className="escon-chat-container" style={{
      display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px',
      border: '1px solid #e2e8f0', borderRadius: '12px',
      overflow: 'hidden', fontFamily: 'Inter, sans-serif', fontSize: '14px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: '#fff'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '12px 16px', background: '#1e293b', color: '#f8fafc',
        fontWeight: 600, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>ESCON — 스킬 성장 코치</span>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
      </div>

      {/* 메시지 영역 */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px', lineHeight: 1.6 }}>
            안녕하세요. 👋<br />스킬 갭 분석, 차기 역할 추천 등<br />엔지니어 성장에 대해 무엇이든 물어보세요.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: msg.role === 'user' ? '#1e293b' : '#ffffff',
              color: msg.role === 'user' ? '#f8fafc' : '#1e293b',
              border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
              lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
              {msg.role === 'assistant' && msg.content === '' && isLoading && (
                 <span className="animate-pulse">...</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <div style={{
        display: 'flex', gap: '8px', padding: '12px',
        background: '#ffffff', borderTop: '1px solid #e2e8f0',
      }}>
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown} placeholder={placeholder}
          disabled={isLoading} rows={1}
          style={{
            flex: 1, resize: 'none', border: '1px solid #e2e8f0',
            borderRadius: '8px', padding: '8px 12px', fontSize: '14px',
            outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
          }}
        />
        <button
          onClick={sendMessage} disabled={isLoading || !input.trim()}
          style={{
            padding: '8px 16px',
            background: isLoading || !input.trim() ? '#94a3b8' : '#1e293b',
            color: '#f8fafc', border: 'none', borderRadius: '8px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: 600,
            transition: 'background 0.2s'
          }}
        >
          {isLoading ? '...' : '전송'}
        </button>
      </div>
    </div>
  )
}
