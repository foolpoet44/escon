'use client';

import { useEffect, useState } from 'react';
import SkillCard from '../components/SkillCard';
import SearchBar from '../components/SearchBar';
import { loadSkillsData, getAllSkills, filterSkills } from '../lib/skills-data';
import { Skill, DomainKey, SkillType, FilterOptions } from '../lib/types';
import { DOMAINS, DOMAIN_COLORS } from '../lib/constants';

export default function SkillsPage() {
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterOptions>({
        domains: [],
        skillTypes: [],
        searchQuery: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const skillsPerPage = 24;

    useEffect(() => {
        loadSkillsData()
            .then((data) => {
                const skills = getAllSkills(data);
                setAllSkills(skills);
                setFilteredSkills(skills);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Failed to load skills:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (allSkills.length === 0) return;

        loadSkillsData().then((data) => {
            const result = filterSkills(data, filters);
            setFilteredSkills(result);
            setCurrentPage(1);
        });
    }, [filters, allSkills.length]);

    const handleDomainToggle = (domainKey: DomainKey) => {
        setFilters((prev) => ({
            ...prev,
            domains: prev.domains.includes(domainKey)
                ? prev.domains.filter((d) => d !== domainKey)
                : [...prev.domains, domainKey]
        }));
    };

    const handleTypeToggle = (type: SkillType) => {
        setFilters((prev) => ({
            ...prev,
            skillTypes: prev.skillTypes.includes(type)
                ? prev.skillTypes.filter((t) => t !== type)
                : [...prev.skillTypes, type]
        }));
    };

    const handleSearch = (query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query }));
    };

    const totalPages = Math.ceil(filteredSkills.length / skillsPerPage);
    const startIndex = (currentPage - 1) * skillsPerPage;
    const paginatedSkills = filteredSkills.slice(startIndex, startIndex + skillsPerPage);

    if (loading) {
        return (
            <main className="page-container">
                <div className="loading">Loading skills...</div>
            </main>
        );
    }

    return (
        <main className="page-container">
            <div className="page-header">
                <h1 className="page-title">All Skills</h1>
                <p className="page-description">
                    Explore all {allSkills.length} skills across {DOMAINS.length} domains
                </p>
            </div>

            <div className="filters-container">
                <SearchBar onSearch={handleSearch} placeholder="Search all skills..." />

                <div className="filter-section">
                    <h3 className="filter-title">Skill Type</h3>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filters.skillTypes.includes('knowledge') ? 'active' : ''}`}
                            onClick={() => handleTypeToggle('knowledge')}
                        >
                            Knowledge
                        </button>
                        <button
                            className={`filter-btn ${filters.skillTypes.includes('skill/competence') ? 'active' : ''}`}
                            onClick={() => handleTypeToggle('skill/competence')}
                        >
                            Skill/Competence
                        </button>
                    </div>
                </div>

                <div className="filter-section">
                    <h3 className="filter-title">Domains</h3>
                    <div className="domain-filters">
                        {DOMAINS.map((domain) => (
                            <button
                                key={domain.key}
                                className={`domain-filter-btn ${filters.domains.includes(domain.key) ? 'active' : ''}`}
                                onClick={() => handleDomainToggle(domain.key)}
                                style={{
                                    borderColor: filters.domains.includes(domain.key) ? domain.color : undefined,
                                    backgroundColor: filters.domains.includes(domain.key) ? `${domain.color}22` : undefined
                                }}
                            >
                                <span className="domain-filter-icon">{domain.icon}</span>
                                <span className="domain-filter-name">{domain.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="results-header">
                <div className="results-info">
                    Showing {startIndex + 1}-{Math.min(startIndex + skillsPerPage, filteredSkills.length)} of {filteredSkills.length} skills
                </div>
                {(filters.domains.length > 0 || filters.skillTypes.length > 0 || filters.searchQuery) && (
                    <button
                        className="clear-filters-btn"
                        onClick={() => setFilters({ domains: [], skillTypes: [], searchQuery: '' })}
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            <div className="skills-grid">
                {paginatedSkills.map((skill) => {
                    // Find which domain this skill belongs to for color
                    const domainEntry = Object.entries(DOMAINS).find(([_, domain]) => {
                        // This is a simplified check - in real scenario, you'd track domain per skill
                        return true;
                    });
                    return <SkillCard key={skill.uri} skill={skill} />;
                })}
            </div>

            {filteredSkills.length === 0 && (
                <div className="no-results">
                    No skills found matching your criteria
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        ← Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}

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
        }

        .filters-container {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .filter-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .filter-buttons {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
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
          background: var(--color-primary)22;
          color: var(--color-primary);
          border-color: var(--color-primary);
        }

        .domain-filters {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--spacing-sm);
        }

        .domain-filter-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .domain-filter-btn:hover {
          transform: translateY(-2px);
        }

        .domain-filter-icon {
          font-size: 1.2rem;
        }

        .domain-filter-name {
          font-size: 0.9rem;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .results-info {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .clear-filters-btn {
          padding: var(--spacing-xs) var(--spacing-md);
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .clear-filters-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .no-results {
          text-align: center;
          padding: var(--spacing-2xl);
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-xl) 0;
        }

        .pagination-btn {
          padding: var(--spacing-sm) var(--spacing-lg);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .pagination-btn:hover:not(:disabled) {
          background: var(--color-primary);
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .loading {
          text-align: center;
          padding: var(--spacing-2xl);
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .skills-grid {
            grid-template-columns: 1fr;
          }

          .domain-filters {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .results-header {
            flex-direction: column;
            gap: var(--spacing-sm);
            align-items: flex-start;
          }
        }
      `}</style>
        </main>
    );
}
