'use client';

import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export default function ErrorState({ 
  title = '데이터를 불러오는데 실패했습니다',
  message = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  onRetry,
  onBack 
}: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h2 className="error-title">{title}</h2>
      <p className="error-message">{message}</p>
      <div className="error-actions">
        {onRetry && (
          <button onClick={onRetry} className="btn-retry">
            다시 시도
          </button>
        )}
        {onBack ? (
          <button onClick={onBack} className="btn-back">
            뒤로 가기
          </button>
        ) : (
          <Link href="/" className="btn-back">
            홈으로
          </Link>
        )}
      </div>

      <style jsx>{`
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem;
          text-align: center;
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .error-message {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 400px;
          line-height: 1.6;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-retry,
        .btn-back {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          text-decoration: none;
        }

        .btn-retry {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          color: white;
          border: none;
          box-shadow: var(--shadow-md);
        }

        .btn-retry:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }

        .btn-back {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 2px solid var(--border-color);
        }

        .btn-back:hover {
          background: var(--bg-secondary);
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
