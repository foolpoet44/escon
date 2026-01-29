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
                <div className="loading">Loading domains...</div>
            </main>
        );
    }

    return (
        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">Explore Domains</h1>
                <p className="page-description">
                    Browse through {DOMAINS.length} specialized domains covering {stats?.totalSkills || 1640} skills
                    in the Physical AI and ESCO ontology
                </p>
            </div>

            <div className="domains-grid">
                {DOMAINS.map((domain) => (
                    <DomainCard key={domain.key} domain={domain} />
                ))}
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
        }
      `}</style>
        </main>
    );
}
