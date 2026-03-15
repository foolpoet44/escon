'use client';

import { useEffect, useState } from 'react';

// 분석 중 사용자에게 보여줄 단계별 메시지
// MiroFish의 시뮬레이션 진행 표시 UX에서 차용
const ANALYSIS_MESSAGES = [
  { icon: '📄', text: '직무 설명 분석 중...' },
  { icon: '🗺️', text: 'ESCO 스킬 온톨로지와 매핑 중...' },
  { icon: '🔎', text: '보유 스킬과 직무 요구 스킬 비교 중...' },
  { icon: '📊', text: '스킬 갭 우선순위 산정 중...' },
  { icon: '🎯', text: '개인화 학습 로드맵 생성 중...' },
];

interface Step3Props {
  isAnalyzing: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function Step3Analyzing({ isAnalyzing, error, onRetry }: Step3Props) {
  const [messageIdx, setMessageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) return;

    // 메시지를 순서대로 교체 (1.2초 간격)
    const msgInterval = setInterval(() => {
      setMessageIdx(prev => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 1200);

    // 진행바: 90%까지만 채움 (실제 완료 시 100% 처리는 부모에서)
    const progInterval = setInterval(() => {
      setProgress(prev => prev < 90 ? prev + 2 : prev);
    }, 400);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [isAnalyzing]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#FF6B6B' }}>
          분석 중 오류가 발생했습니다
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {error}
        </p>
        <button
          onClick={onRetry}
          style={{
            padding: '0.9rem 2rem',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      {/* 회전 아이콘 */}
      <div style={{
        fontSize: '4rem',
        marginBottom: '1.5rem',
        animation: 'spin 2s linear infinite',
        display: 'inline-block',
      }}>
        🤖
      </div>

      <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        AI가 분석 중입니다
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        잠시만 기다려주세요
      </p>

      {/* 진행바 */}
      <div style={{
        width: '100%',
        height: '6px',
        background: 'var(--bg-tertiary)',
        borderRadius: '3px',
        marginBottom: '1.5rem',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
          borderRadius: '3px',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* 단계별 메시지 */}
      <div style={{
        padding: '1rem 1.5rem',
        background: 'var(--bg-tertiary)',
        borderRadius: '8px',
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
        minHeight: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
      }}>
        <span style={{ fontSize: '1.2rem' }}>{ANALYSIS_MESSAGES[messageIdx].icon}</span>
        <span>{ANALYSIS_MESSAGES[messageIdx].text}</span>
      </div>

      {/* CSS 애니메이션 - style jsx 대신 인라인 스타일 태그 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
