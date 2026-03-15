'use client';

import { useEffect, useState } from 'react';
import DomainCard from '../components/DomainCard';
import { DOMAINS } from '../lib/constants';
import { loadSkillsData, calculateStatistics } from '../lib/skills-data';
import { Statistics } from '../lib/types';

export default function DomainsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkillsData()
      .then((data) => {
        const statistics = calculateStatistics(data);
        setStats(statistics);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load skills data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="page-container">
        <div className="loading">도메인 로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">Factory Robotics 도메인 탐색</h1>
        <p className="page-description">
          스마트 팩토리 로봇기술 스택의 {stats?.totalSkills || 1640}개 스킬과 {DOMAINS.length}개 전문 도메인
        </p>
      </div>

      <div className="domains-container">
        {/* Robot Core Systems */}
        <section className="domain-group">
          <h2 className="group-title">🦾 Robot Core Systems (로봇 핵심 시스템)</h2>
          <div className="domains-grid">
            {DOMAINS.filter(d => ['robotics', 'manipulation', 'control'].includes(d.key)).map(domain => (
              <DomainCard key={domain.key} domain={domain} />
            ))}
          </div>
        </section>

        {/* Sensing & Autonomy */}
        <section className="domain-group">
          <h2 className="group-title">👁️ Sensing & Autonomy (인지/자율)</h2>
          <div className="domains-grid">
            {DOMAINS.filter(d => ['perception', 'navigation', 'ai_ml'].includes(d.key)).map(domain => (
              <DomainCard key={domain.key} domain={domain} />
            ))}
          </div>
        </section>

        {/* Factory Integration */}
        <section className="domain-group">
          <h2 className="group-title">🏭 Factory Integration (현장 통합)</h2>
          <div className="domains-grid">
            {DOMAINS.filter(d => ['integration', 'safety', 'mechatronics', 'manufacturing'].includes(d.key)).map(domain => (
              <DomainCard key={domain.key} domain={domain} />
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .page-header {
          text-align: center;
          margin-bottom: var(--spacing-2xl);
        }

        .page-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--spacing-md);
        }

        .page-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto;
        }

        .domains-container {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xl);
        }

        .domain-group {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: var(--spacing-xl);
        }

        .group-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .domains-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--spacing-lg);
        }

        .loading {
          text-align: center;
          padding: var(--spacing-2xl);
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .domains-grid {
            grid-template-columns: 1fr;
          }
          
          .domain-group {
            padding: var(--spacing-md);
          }
        }
      `}</style>
    </main>
  );
}
