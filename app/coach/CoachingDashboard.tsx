'use client'

import { useState } from 'react'
import { ChatWidget } from '../components/ChatWidget'

interface SimpleEnabler {
  id: string
  name: string
  code: string
}

export default function CoachingDashboard({ enablers }: { enablers: SimpleEnabler[] }) {
  const [targetId, setTargetId] = useState<string>(enablers[0]?.id || '');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(250px, 300px) 1fr',
      gap: '24px',
      alignItems: 'start',
      minHeight: '600px'
    }}>
      {/* 🚀 좌측: 설정 및 컨텍스트 메뉴 */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        border: '1px solid #f1f5f9'
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', color: '#1e293b' }}>
          🎯 코칭 타겟 설정
        </h2>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#64748b' }}>
            성장하고 싶은 목표 역할
          </label>
          <select 
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '0.95rem',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          >
            <option value="">(자동 탐색 - 추천 역할)</option>
            {enablers.map(en => (
              <option key={en.id} value={en.id}>{en.name}</option>
            ))}
          </select>
          <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
            선택하신 역할의 요구 역량과 귀하의 현재 데이터를 엔진이 실시간으로 비례 분석하여 코칭합니다.
          </p>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: '#334155' }}>💡 코칭 팁</h3>
          <ul style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
            <li><i>"내 기술적 공백을 요약해줘"</i></li>
            <li><i>"1순위로 채워야 할 기술을 어떻게 공부해?"</i></li>
            <li><i>"단기 프로젝트 아이디어 추천해줘"</i></li>
          </ul>
        </div>
      </div>

      {/* 💬 우측: ESCON 채팅 위젯 영역 */}
      <div style={{ height: '100%' }}>
         <ChatWidget 
            targetEnablerId={targetId === '' ? undefined : targetId} 
            placeholder={targetId ? "설정된 목표 역할에 대해 질문하세요..." : "보편적 성장에 대해 무엇이든 물어보세요..."}
         />
      </div>
    </div>
  )
}
