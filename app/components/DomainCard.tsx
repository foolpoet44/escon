import Link from 'next/link';
import { Domain } from '../lib/types';

interface DomainCardProps {
    domain: Domain;
}

export default function DomainCard({ domain }: DomainCardProps) {
    return (
        <Link href={`/domains/${domain.key}`} className="domain-card">
            <div className="domain-icon">{domain.icon}</div>
            <h3 className="domain-name">{domain.name}</h3>
            <p className="domain-description">{domain.description}</p>
            <div className="domain-stats">
                <span className="skill-count">{domain.skillCount}</span>
                <span className="skill-label">skills</span>
            </div>

            <style jsx>{`
        .domain-card {
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
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
        }

        .domain-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: ${domain.color};
          transform: scaleX(0);
          transition: transform var(--transition-base);
        }

        .domain-card:hover::before {
          transform: scaleX(1);
        }

        .domain-card:hover {
          transform: translateY(-8px);
          border-color: ${domain.color};
          box-shadow: var(--shadow-lg);
          background: var(--bg-tertiary);
        }

        .domain-icon {
          font-size: 3.5rem;
          transition: transform var(--transition-base);
        }

        .domain-card:hover .domain-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .domain-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .domain-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          flex-grow: 1;
        }

        .domain-stats {
          display: flex;
          align-items: baseline;
          gap: var(--spacing-xs);
          padding-top: var(--spacing-sm);
          border-top: 1px solid var(--border-color);
        }

        .skill-count {
          font-size: 2rem;
          font-weight: 700;
          color: ${domain.color};
        }

        .skill-label {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
        </Link>
    );
}
