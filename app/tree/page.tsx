"use client";

import { useState, useEffect } from 'react';
import { SkillsData, DomainKey } from '../lib/types';
import { loadSkillsData } from '../lib/skills-data';
import {
    createDomainSkillTree,
    createSingleDomainTree,
    createSkillTypeTree,
    createFilteredTree,
    TreeNode
} from '../lib/skill-tree';
import { DOMAINS } from '../lib/constants';
import SkillTree from '../components/SkillTree';
import SearchBar from '../components/SearchBar';

type ViewMode = 'all-domains' | 'single-domain' | 'by-type';

export default function TreePage() {
    const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('all-domains');
    const [selectedDomain, setSelectedDomain] = useState<DomainKey>('robotics');
    const [searchTerm, setSearchTerm] = useState('');
    const [treeData, setTreeData] = useState<TreeNode>({ name: 'Loading...', attributes: {} });

    useEffect(() => {
        loadSkillsData()
            .then((data) => {
                setSkillsData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Failed to load skills data:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!skillsData) return;

        let newTreeData: TreeNode;

        if (searchTerm.trim()) {
            newTreeData = createFilteredTree(skillsData, searchTerm);
        } else {
            switch (viewMode) {
                case 'all-domains':
                    newTreeData = createDomainSkillTree(skillsData);
                    break;
                case 'single-domain':
                    newTreeData = createSingleDomainTree(skillsData, selectedDomain);
                    break;
                case 'by-type':
                    newTreeData = createSkillTypeTree(skillsData);
                    break;
                default:
                    newTreeData = createDomainSkillTree(skillsData);
            }
        }

        setTreeData(newTreeData);
    }, [skillsData, viewMode, selectedDomain, searchTerm]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    if (loading) {
        return (
            <main className="page-container">
                <div className="loading">Loading skill tree...</div>
            </main>
        );
    }

    return (
        <main className="page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Skill Tree</h1>
                    <p className="page-description">
                        Hierarchical visualization of skills organized by domains and types
                    </p>
                </div>
            </div>

            {/* 검색 바 */}
            <div className="search-section">
                <SearchBar
                    onSearch={handleSearch}
                    placeholder="Search skills in the tree..."
                />
                {searchTerm && (
                    <button
                        className="clear-search"
                        onClick={() => setSearchTerm('')}
                    >
                        Clear Search
                    </button>
                )}
            </div>

            {/* 뷰 모드 선택 */}
            {!searchTerm && (
                <div className="view-mode-selector">
                    <button
                        className={`mode-button ${viewMode === 'all-domains' ? 'active' : ''}`}
                        onClick={() => setViewMode('all-domains')}
                    >
                        <span className="mode-icon">🌳</span>
                        <div className="mode-content">
                            <div className="mode-title">All Domains</div>
                            <div className="mode-desc">View all domains and their skills</div>
                        </div>
                    </button>
                    <button
                        className={`mode-button ${viewMode === 'single-domain' ? 'active' : ''}`}
                        onClick={() => setViewMode('single-domain')}
                    >
                        <span className="mode-icon">🎯</span>
                        <div className="mode-content">
                            <div className="mode-title">Single Domain</div>
                            <div className="mode-desc">Focus on one domain</div>
                        </div>
                    </button>
                    <button
                        className={`mode-button ${viewMode === 'by-type' ? 'active' : ''}`}
                        onClick={() => setViewMode('by-type')}
                    >
                        <span className="mode-icon">📊</span>
                        <div className="mode-content">
                            <div className="mode-title">By Type</div>
                            <div className="mode-desc">Group by Knowledge/Competence</div>
                        </div>
                    </button>
                </div>
            )}

            {/* 도메인 선택 (Single Domain 모드일 때만) */}
            {viewMode === 'single-domain' && !searchTerm && (
                <div className="domain-selector-section">
                    <label className="selector-label">Select Domain:</label>
                    <div className="domain-buttons">
                        {DOMAINS.map(domain => (
                            <button
                                key={domain.key}
                                className={`domain-button ${selectedDomain === domain.key ? 'active' : ''}`}
                                onClick={() => setSelectedDomain(domain.key)}
                            >
                                <span className="domain-icon">{domain.icon}</span>
                                <span className="domain-name">{domain.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 트리 시각화 */}
            <div className="tree-section">
                <div className="tree-card">
                    <div className="tree-header">
                        <div className="tree-info">
                            <h2 className="tree-title">{treeData.name}</h2>
                            {treeData.attributes?.count && (
                                <span className="tree-count">
                                    {treeData.attributes.count} total skills
                                </span>
                            )}
                        </div>
                        <div className="tree-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#667eea' }}></div>
                                <span>Root/Competence</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#4ECDC4' }}></div>
                                <span>Domain</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#98D8C8' }}></div>
                                <span>Knowledge</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#F6AD55' }}></div>
                                <span>Skill Type</span>
                            </div>
                        </div>
                    </div>

                    <SkillTree data={treeData} width={1200} height={800} />

                    <div className="tree-instructions">
                        <p>💡 <strong>Tip:</strong> Click on nodes to expand/collapse branches and view details. Use mouse wheel to zoom, and drag to pan.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .page-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .page-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .page-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--spacing-sm);
        }

        .page-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .search-section {
          margin-bottom: var(--spacing-xl);
          display: flex;
          gap: var(--spacing-md);
          align-items: center;
        }

        .clear-search {
          padding: var(--spacing-sm) var(--spacing-lg);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
        }

        .clear-search:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .view-mode-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .mode-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .mode-button:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .mode-button.active {
          border-color: var(--color-primary);
          background: linear-gradient(135deg, var(--color-primary)22, var(--color-secondary)22);
        }

        .mode-icon {
          font-size: 2rem;
        }

        .mode-content {
          text-align: left;
        }

        .mode-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .mode-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .domain-selector-section {
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-lg);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .selector-label {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
        }

        .domain-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--spacing-sm);
        }

        .domain-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .domain-button:hover {
          border-color: var(--color-primary);
        }

        .domain-button.active {
          border-color: var(--color-primary);
          background: linear-gradient(135deg, var(--color-primary)22, var(--color-secondary)22);
        }

        .domain-icon {
          font-size: 1.5rem;
        }

        .domain-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tree-section {
          margin-bottom: var(--spacing-2xl);
        }

        .tree-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          border: 1px solid var(--border-color);
        }

        .tree-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .tree-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .tree-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .tree-count {
          font-size: 0.95rem;
          color: var(--text-muted);
        }

        .tree-legend {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .tree-instructions {
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--color-primary);
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .loading {
          text-align: center;
          padding: var(--spacing-2xl);
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .tree-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .search-section {
            flex-direction: column;
          }

          .clear-search {
            width: 100%;
          }
        }
      `}</style>
        </main>
    );
}
