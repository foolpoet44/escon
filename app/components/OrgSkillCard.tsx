"use client";

import { Skill } from '../lib/types';
import { truncateDescription } from '../lib/skills-data';

// 조직 컨텍스트가 포함된 확장 스킬 타입
export interface EnrichedSkill extends Skill {
    org_context?: {
        organization: string;
        enabler: string;
        importance: number;
        target_proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
        priority_rank: number;
        korean_label?: string;
        notes?: string;
    };
    match_type?: 'exact' | 'approximate' | 'custom';
}

interface OrgSkillCardProps {
    skill: EnrichedSkill;
    showOrgContext?: boolean;
}

export default function OrgSkillCard({
    skill,
    showOrgContext = true
}: OrgSkillCardProps) {
    const { org_context, match_type } = skill;
    const importanceColor = getImportanceColor(org_context?.importance || 1);
    const matchIcon = getMatchIcon(match_type);

    return (
        <div className="org-skill-card">
            {/* Header with badges */}
            <div className="skill-header">
                {/* Importance stars */}
                {org_context && (
                    <div className="importance-badge">
                        {'⭐'.repeat(org_context.importance)}
                    </div>
                )}

                {/* Match type badge */}
                {match_type && (
                    <div className="match-badge">
                        <span className="match-icon">{matchIcon}</span>
                        <span className="match-text">{getMatchLabel(match_type)}</span>
                    </div>
                )}
            </div>

            {/* Skill names */}
            <div className="skill-names">
                <h3 className="skill-name-ko">
                    {org_context?.korean_label || skill.label}
                </h3>
                {org_context?.korean_label && (
                    <p className="skill-name-en">{skill.label}</p>
                )}
            </div>

            {/* Type badge */}
            <div className="skill-meta">
                <span className={`skill-type-badge ${skill.type}`}>
                    {skill.type === 'knowledge' ? '📚 Knowledge' : '🛠️ Skill'}
                </span>

                {/* Target proficiency */}
                {org_context && (
                    <span className="proficiency-badge">
                        목표: <strong>{org_context.target_proficiency}</strong>
                    </span>
                )}
            </div>

            {/* Description */}
            <p className="skill-description">
                {truncateDescription(skill.description, 150)}
            </p>

            {/* Footer */}
            <div className="skill-footer">
                {/* Enabler tag */}
                {org_context && showOrgContext && (
                    <span className="enabler-tag">
                        📍 {org_context.enabler}
                    </span>
                )}

                {/* ESCO link */}
                <a
                    href={skill.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="esco-link"
                    onClick={(e) => e.stopPropagation()}
                >
                    🔗 ESCO
                </a>
            </div>

            {/* Notes tooltip */}
            {org_context?.notes && (
                <div className="notes-tooltip">
                    💡 {org_context.notes}
                </div>
            )}

            <style jsx>{`
        .org-skill-card {
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          transition: all var(--transition-base);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          position: relative;
          overflow: hidden;
        }

        /* Left accent bar */
        .org-skill-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: ${importanceColor};
          transform: scaleY(0);
          transition: transform var(--transition-base);
        }

        .org-skill-card:hover::before {
          transform: scaleY(1);
        }

        .org-skill-card:hover {
          transform: translateX(4px);
          border-color: ${importanceColor};
          box-shadow: 0 4px 20px ${importanceColor}22;
          background: var(--bg-tertiary);
        }

        /* Header */
        .skill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .importance-badge {
          font-size: 1rem;
          line-height: 1;
          color: ${importanceColor};
        }

        .match-badge {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .match-icon {
          font-size: 0.9rem;
        }

        .match-text {
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Skill names */
        .skill-names {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .skill-name-ko {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .skill-name-en {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0;
          font-style: italic;
        }

        /* Meta badges */
        .skill-meta {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .skill-type-badge {
          font-size: 0.75rem;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          font-weight: 600;
          white-space: nowrap;
        }

        .skill-type-badge.knowledge {
          background: #4ECDC422;
          color: #4ECDC4;
        }

        .skill-type-badge.skill\\/competence {
          background: #FF6B6B22;
          color: #FF6B6B;
        }

        .proficiency-badge {
          font-size: 0.8rem;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: ${importanceColor}22;
          color: ${importanceColor};
          border-radius: var(--radius-sm);
          font-weight: 500;
        }

        .proficiency-badge strong {
          font-weight: 700;
        }

        /* Description */
        .skill-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        /* Footer */
        .skill-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--spacing-sm);
          border-top: 1px solid var(--border-color);
          gap: var(--spacing-sm);
        }

        .enabler-tag {
          font-size: 0.8rem;
          color: var(--text-muted);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          flex-grow: 1;
        }

        .esco-link {
          font-size: 0.8rem;
          color: #4ECDC4;
          text-decoration: none;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: #4ECDC411;
          border-radius: var(--radius-sm);
          transition: all var(--transition-base);
          white-space: nowrap;
        }

        .esco-link:hover {
          background: #4ECDC422;
          color: #4ECDC4;
          transform: translateX(2px);
        }

        /* Notes tooltip */
        .notes-tooltip {
          font-size: 0.85rem;
          color: var(--text-secondary);
          background: var(--bg-secondary);
          padding: var(--spacing-sm);
          border-radius: var(--radius-sm);
          border-left: 3px solid #FFD93D;
          margin-top: var(--spacing-xs);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .skill-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .skill-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .enabler-tag {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}

// Helper functions
function getImportanceColor(importance: number): string {
    const colors: Record<number, string> = {
        5: '#FF6B6B', // 최우선
        4: '#FFA500', // 높음
        3: '#FFD93D', // 중간
        2: '#6BCF7F', // 낮음
        1: '#95E1D3', // 최하
    };
    return colors[importance] || '#95E1D3';
}

function getMatchIcon(matchType?: string): string {
    const icons: Record<string, string> = {
        exact: '✅',
        approximate: '⚠️',
        custom: '🔧',
    };
    return icons[matchType || 'exact'] || '✅';
}

function getMatchLabel(matchType: string): string {
    const labels: Record<string, string> = {
        exact: 'Exact',
        approximate: 'Similar',
        custom: 'Custom',
    };
    return labels[matchType] || 'Exact';
}
