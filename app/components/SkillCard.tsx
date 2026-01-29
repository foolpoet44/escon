import { Skill } from '../lib/types';
import { truncateDescription, extractIdFromUri } from '../lib/skills-data';
import { SKILL_TYPE_LABELS } from '../lib/constants';

interface SkillCardProps {
    skill: Skill;
    domainColor?: string;
}

export default function SkillCard({ skill, domainColor = 'var(--color-primary)' }: SkillCardProps) {
    const skillId = extractIdFromUri(skill.uri);

    return (
        <div className="skill-card">
            <div className="skill-header">
                <h3 className="skill-label">{skill.label}</h3>
                <span className="skill-type-badge">{SKILL_TYPE_LABELS[skill.type]}</span>
            </div>

            <p className="skill-description">
                {truncateDescription(skill.description, 200)}
            </p>

            <div className="skill-footer">
                <span className="skill-id">ID: {skillId.substring(0, 8)}...</span>
            </div>

            <style jsx>{`
        .skill-card {
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

        .skill-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: ${domainColor};
          transform: scaleY(0);
          transition: transform var(--transition-base);
        }

        .skill-card:hover::before {
          transform: scaleY(1);
        }

        .skill-card:hover {
          transform: translateX(4px);
          border-color: ${domainColor};
          box-shadow: var(--shadow-md);
          background: var(--bg-tertiary);
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--spacing-md);
        }

        .skill-label {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
          flex-grow: 1;
          line-height: 1.4;
        }

        .skill-type-badge {
          font-size: 0.75rem;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: ${domainColor}22;
          color: ${domainColor};
          border-radius: var(--radius-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .skill-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .skill-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--spacing-sm);
          border-top: 1px solid var(--border-color);
        }

        .skill-id {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: monospace;
        }
      `}</style>
        </div>
    );
}
