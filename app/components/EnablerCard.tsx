"use client";

import Link from 'next/link';

// Enabler 타입 정의
export interface Enabler {
  id: string;
  name: string;
  name_en: string;
  description: string;
  priority: number;
  skillCount: number;
  expertSkillCount?: number;
  color?: string;
}

interface EnablerCardProps {
  enabler: Enabler;
  organizationId?: string;
  onClick?: () => void;
}

export default function EnablerCard({
  enabler,
  organizationId,
  onClick
}: EnablerCardProps) {
  const cardColor = enabler.color || getPriorityColor(enabler.priority);
  const href = `/organizations/${organizationId}/enablers/${enabler.id}`;

  return (
    <Link
      href={href}
      className="enabler-card"
      onClick={onClick}
    >
      {/* Priority Badge */}
      <div className="priority-badge">
        <span className="priority-icon">🎯</span>
        <span className="priority-text">Priority {enabler.priority}</span>
      </div>

      {/* Enabler Header */}
      <div className="enabler-header">
        <h3 className="enabler-name">{enabler.name}</h3>
        <p className="enabler-subtitle">{enabler.name_en}</p>
      </div>

      {/* Description */}
      <p className="enabler-description">{enabler.description}</p>

      {/* Stats */}
      <div className="enabler-stats">
        <div className="stat-item">
          <span className="stat-value">{enabler.skillCount}</span>
          <span className="stat-label">스킬</span>
        </div>
        {enabler.expertSkillCount !== undefined && (
          <div className="stat-item highlight">
            <span className="stat-value">{enabler.expertSkillCount}</span>
            <span className="stat-label">Expert 필요</span>
          </div>
        )}
      </div>

      {/* Hover Arrow */}
      <div className="arrow-icon">→</div>

      <style jsx>{`
        .enabler-card {
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          text-decoration: none;
          color: var(--text-primary);
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          min-height: 280px;
        }

        /* Top accent bar */
        .enabler-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, ${cardColor}, ${cardColor}88);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform var(--transition-base);
        }

        .enabler-card:hover::before {
          transform: scaleX(1);
        }

        /* Hover effects */
        .enabler-card:hover {
          transform: translateY(-8px);
          border-color: ${cardColor};
          box-shadow: 0 12px 40px ${cardColor}22;
          background: var(--bg-tertiary);
        }

        /* Priority Badge */
        .priority-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-md);
          background: ${cardColor}22;
          border: 1px solid ${cardColor}44;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          color: ${cardColor};
          align-self: flex-start;
          transition: all var(--transition-base);
        }

        .enabler-card:hover .priority-badge {
          background: ${cardColor}33;
          border-color: ${cardColor};
        }

        .priority-icon {
          font-size: 1rem;
        }

        .priority-text {
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Header */
        .enabler-header {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .enabler-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.3;
          transition: color var(--transition-base);
        }

        .enabler-card:hover .enabler-name {
          color: ${cardColor};
        }

        .enabler-subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0;
          font-style: italic;
        }

        /* Description */
        .enabler-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          flex-grow: 1;
        }

        /* Stats */
        .enabler-stats {
          display: flex;
          gap: var(--spacing-lg);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--border-color);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: ${cardColor};
          line-height: 1;
        }

        .stat-item.highlight .stat-value {
          color: #FF6B6B;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Arrow Icon */
        .arrow-icon {
          position: absolute;
          bottom: var(--spacing-lg);
          right: var(--spacing-lg);
          font-size: 1.5rem;
          color: ${cardColor};
          opacity: 0;
          transform: translateX(-10px);
          transition: all var(--transition-base);
        }

        .enabler-card:hover .arrow-icon {
          opacity: 1;
          transform: translateX(0);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .enabler-card {
            min-height: auto;
            padding: var(--spacing-lg);
          }

          .enabler-name {
            font-size: 1.25rem;
          }

          .stat-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </Link>
  );
}

// Priority에 따른 색상 매핑
function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = {
    1: '#FF6B6B', // 빨강 (최우선)
    2: '#FFA500', // 주황
    3: '#4ECDC4', // 틸
    4: '#45B7D1', // 스카이블루
    5: '#95E1D3', // 민트
  };
  return colors[priority] || '#4ECDC4';
}
