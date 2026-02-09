'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useCollaboration } from '../lib/collaboration';
import LoadingSpinner from '../components/LoadingSpinner';

const CollaborativeNetworkGraph = dynamic(
  () => import('../components/CollaborativeNetworkGraph'),
  {
    ssr: false,
    loading: () => <LoadingSpinner text="협업 그래프 로딩 중..." />,
  }
);

export default function CollaboratePage() {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && roomId.trim()) {
      setJoined(true);
    }
  };

  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRoomId(randomId);
  };

  if (!joined) {
    return (
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '3rem',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              실시간 협업
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              팀원들과 함께 스킬 네트워크를 실시간으로 편집하세요
            </p>
          </div>

          <form onSubmit={handleJoin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                이름
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="홍길동"
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                방 ID
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="ROOM1234"
                  required
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                  }}
                />
                <button
                  type="button"
                  onClick={generateRoomId}
                  style={{
                    padding: '1rem 1.5rem',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  생성
                </button>
              </div>
              <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                같은 방 ID를 입력하면 팀원과 함께 작업할 수 있습니다
              </small>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              입장하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <CollaborativeNetworkGraph
      roomId={roomId}
      userName={userName}
    />
  );
}
