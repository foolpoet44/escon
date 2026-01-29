'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SkillCard from '../../components/SkillCard';
import SearchBar from '../../components/SearchBar';
import { loadSkillsData, getSkillsByDomain, searchSkills, filterSkillsByType } from '../../lib/skills-data';
import { Skill, DomainKey, SkillType } from '../../lib/types';
import { DOMAINS, DOMAIN_COLORS } from '../../lib/constants';

export default function DomainDetailPage() {
    const params = useParams();
    const domainKey = params.domain as DomainKey;

    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<SkillType[]>([]);

    const domain = DOMAINS.find((d) => d.key === domainKey);
    const domainColor = domain ? DOMAIN_COLORS[domainKey] : 'var(--color-primary)';

    useEffect(() => {
        loadSkillsData()
            .then((data) => {
                const skills = getSkillsByDomain(data, domainKey);
                setAllSkills(skills);
                setFilteredSkills(skills);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Failed to load skills:', error);
                setLoading(false);
            });
    }, [domainKey]);

    useEffect(() => {
        let result = allSkills;

        if (selectedTypes.length > 0) {
            result = filterSkillsByType(result, selectedTypes);
        }

        if (searchQuery) {
            result = searchSkills(result, searchQuery);
        }

        setFilteredSkills(result);
    }, [searchQuery, selectedTypes, allSkills]);

    const handleTypeToggle = (type: SkillType) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    if (loading) {
        return (
            <main className="page-container">
                <div className="loading">Loading skills...</div>
            </main>
        );
    }

    if (!domain) {
        return (
            <main className="page-container">
                <div className="error">Domain not found</div>
            </main>
        );
    }

    const knowledgeCount = allSkills.filter((s) => s.type === 'knowledge').length;
    const competenceCount = allSkills.filter((s) => s.type === 'skill/competence').length;

    return (
        <main className="page-container">
            <div className="domain-header" style={{ borderColor: domainColor }}>
                <div className="domain-icon-large">{domain.icon}</div>
                <div className="domain-info">
                    <h1 className="domain-title">{domain.name}</h1>
                    <p className="domain-desc">{domain.description}</p>
                    <div className="domain-stats-row">
                        <div className="stat-item">
                            <span className="stat-value">{allSkills.length}</span>
                            <span className="stat-label">Total Skills</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{knowledgeCount}</span>
                            <span className="stat-label">Knowledge</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{competenceCount}</span>
                            <span className="stat-label">Competence</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <SearchBar onSearch={setSearchQuery} placeholder="Search skills in this domain..." />

                <div className="type-filters">
                    <button
                        className={`filter-btn ${selectedTypes.includes('knowledge') ? 'active' : ''}`}
                        onClick={() => handleTypeToggle('knowledge')}
                        style={{ borderColor: selectedTypes.includes('knowledge') ? domainColor : undefined }}
                    >
                        Knowledge ({knowledgeCount})
                    </button>
                    <button
                        className={`filter-btn ${selectedTypes.includes('skill/competence') ? 'active' : ''}`}
                        onClick={() => handleTypeToggle('skill/competence')}
                        style={{ borderColor: selectedTypes.includes('skill/competence') ? domainColor : undefined }}
                    >
                        Skill/Competence ({competenceCount})
                    </button>
                </div>
            </div>

            <div className="results-info">
                Showing {filteredSkills.length} of {allSkills.length} skills
            </div>

            <div className="skills-grid">
                {filteredSkills.map((skill) => (
                    <SkillCard key={skill.uri} skill={skill} domainColor={domainColor} />
                ))}
            </div>

            {filteredSkills.length === 0 && (
                <div className="no-results">
                    No skills found matching your criteria
                </div>
            )}

            <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .domain-header {
          display: flex;
          gap: var(--spacing-xl);
          align-items: center;
          padding: var(--spacing-2xl);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border-left: 6px solid;
          margin-bottom: var(--spacing-2xl);
        }

        .domain-icon-large {
          font-size: 5rem;
        }

        .domain-info {
          flex-grow: 1;
        }

        .domain-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--text-primary);
        }

        .domain-desc {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin: 0 0 var(--spacing-lg) 0;
        }

        .domain-stats-row {
          display: flex;
          gap: var(--spacing-xl);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: ${domainColor};
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filters-section {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          flex-wrap: wrap;
        }

        .filters-section > :first-child {
          flex-grow: 1;
        }

        .type-filters {
          display: flex;
          gap: var(--spacing-sm);
        }

        .filter-btn {
          padding: var(--spacing-sm) var(--spacing-lg);
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .filter-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: ${domainColor}22;
          color: ${domainColor};
        }

        .results-info {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: var(--spacing-md);
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--spacing-lg);
        }

        .loading, .error, .no-results {
          text-align: center;
          padding: var(--spacing-2xl);
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .domain-header {
            flex-direction: column;
            text-align: center;
          }

          .domain-stats-row {
            justify-content: center;
          }

          .skills-grid {
            grid-template-columns: 1fr;
          }

          .filters-section {
            flex-direction: column;
          }
        }
      `}</style>
        </main>
    );
}
