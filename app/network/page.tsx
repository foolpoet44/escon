"use client";

import { useState, useEffect } from 'react';
import { DomainKey, SkillsData } from '../lib/types';
import { loadSkillsData } from '../lib/skills-data';
import { createNetworkGraphData, createDomainSkillNetwork, createSkillTypeNetwork, GraphData, GraphNode } from '../lib/network-graph';
import { DOMAINS } from '../lib/constants';
import NetworkGraph from '../components/NetworkGraph';
import DomainSelector from '../components/DomainSelector';

type ViewMode = 'domain-overview' | 'domain-detail' | 'skill-type';

export default function NetworkPage() {
    const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('domain-overview');
    const [selectedDomains, setSelectedDomains] = useState<DomainKey[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<DomainKey | null>(null);
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

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

        switch (viewMode) {
            case 'domain-overview':
                setGraphData(createNetworkGraphData(skillsData, selectedDomains, 30));
                break;
            case 'domain-detail':
                if (selectedDomain) {
                    setGraphData(createDomainSkillNetwork(skillsData, selectedDomain, 50));
                }
                break;
            case 'skill-type':
                setGraphData(createSkillTypeNetwork(skillsData));
                break;
        }
    }, [skillsData, viewMode, selectedDomains, selectedDomain]);

    const handleNodeClick = (node: GraphNode) => {
        setSelectedNode(node);

        // 도메인 노드 클릭 시 상세 뷰로 전환
        if (node.type === 'domain' && node.id.startsWith('domain-')) {
            const domainKey = node.id.replace('domain-', '') as DomainKey;
            setSelectedDomain(domainKey);
            setViewMode('domain-detail');
        }
    };

    const handleBackToOverview = () => {
        setViewMode('domain-overview');
        setSelectedDomain(null);
        setSelectedNode(null);
    };

    if (loading) {
        return (
            <main className="page-container">
                <div className="loading">Loading network visualization...</div>
            </main>
        );
    }

    return (
        <main className="page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Network Graph</h1>
                    <p className="page-description">
                        Interactive visualization of skill relationships and domain connections
                    </p>
                </div>
            </div>

            {/* 뷰 모드 선택 */}
            <div className="view-mode-selector">
                <button
                    className={`mode-button ${viewMode === 'domain-overview' ? 'active' : ''}`}
                    onClick={() => setViewMode('domain-overview')}
                >
                    <span className="mode-icon">🌐</span>
                    <div className="mode-content">
                        <div className="mode-title">Domain Overview</div>
                        <div className="mode-desc">View all domains and their skills</div>
                    </div>
                </button>
                <button
                    className={`mode-button ${viewMode === 'skill-type' ? 'active' : ''}`}
                    onClick={() => setViewMode('skill-type')}
                >
                    <span className="mode-icon">🎯</span>
                    <div className="mode-content">
                        <div className="mode-title">Skill Types</div>
                        <div className="mode-desc">Knowledge vs Competence distribution</div>
                    </div>
                </button>
            </div>

            {/* 도메인 선택 (Overview 모드일 때만) */}
            {viewMode === 'domain-overview' && (
                <DomainSelector
                    selectedDomains={selectedDomains}
                    onDomainChange={setSelectedDomains}
                    maxSelections={5}
                />
            )}

            {/* 상세 뷰 헤더 */}
            {viewMode === 'domain-detail' && selectedDomain && (
                <div className="detail-header">
                    <button className="back-button" onClick={handleBackToOverview}>
                        ← Back to Overview
                    </button>
                    <h2 className="detail-title">
                        {DOMAINS.find(d => d.key === selectedDomain)?.icon}{' '}
                        {DOMAINS.find(d => d.key === selectedDomain)?.name} Network
                    </h2>
                </div>
            )}

            {/* 그래프 영역 */}
            <div className="graph-section">
                <div className="graph-card">
                    <div className="graph-header">
                        <div className="graph-stats">
                            <div className="stat-item">
                                <span className="stat-icon">📍</span>
                                <span className="stat-text">{graphData.nodes.length} nodes</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-icon">🔗</span>
                                <span className="stat-text">{graphData.links.length} connections</span>
                            </div>
                        </div>
                        <div className="graph-legend">
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#667eea' }}></div>
                                <span>Competence</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#98D8C8' }}></div>
                                <span>Knowledge</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color" style={{ background: '#F6AD55' }}></div>
                                <span>Common Skills</span>
                            </div>
                        </div>
                    </div>

                    <NetworkGraph
                        data={graphData}
                        width={1200}
                        height={700}
                        onNodeClick={handleNodeClick}
                    />

                    <div className="graph-instructions">
                        <p>💡 <strong>Tip:</strong> Hover over nodes to highlight connections. Click on domain nodes to explore in detail.</p>
                    </div>
                </div>

                {/* 선택된 노드 정보 */}
                {selectedNode && (
                    <div className="node-info-panel">
                        <h3 className="panel-title">
                            {selectedNode.type === 'domain' ? '📂' : '⚡'} {selectedNode.label}
                        </h3>
                        <div className="panel-content">
                            <div className="info-row">
                                <span className="info-label">Type:</span>
                                <span className="info-value">
                                    {selectedNode.type === 'domain' ? 'Domain' : 'Skill'}
                                </span>
                            </div>
                            {selectedNode.skillType && (
                                <div className="info-row">
                                    <span className="info-label">Skill Type:</span>
                                    <span className="info-value">
                                        {selectedNode.skillType === 'knowledge' ? 'Knowledge' : 'Competence'}
                                    </span>
                                </div>
                            )}
                            {selectedNode.domain && (
                                <div className="info-row">
                                    <span className="info-label">Domain:</span>
                                    <span className="info-value">{selectedNode.domain}</span>
                                </div>
                            )}
                            <div className="info-row">
                                <span className="info-label">ID:</span>
                                <span className="info-value id-text">{selectedNode.id}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .page-container {
          max-width: 1600px;
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
          margin-bottom: var(--spacing-sm);
        }

        .page-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .view-mode-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

        .detail-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-lg);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
        }

        .back-button {
          padding: var(--spacing-sm) var(--spacing-lg);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .back-button:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .detail-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .graph-section {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: var(--spacing-xl);
        }

        .graph-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          border: 1px solid var(--border-color);
        }

        .graph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .graph-stats {
          display: flex;
          gap: var(--spacing-lg);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--text-secondary);
        }

        .stat-icon {
          font-size: 1.2rem;
        }

        .graph-legend {
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

        .graph-instructions {
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--color-primary);
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .node-info-panel {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          border: 1px solid var(--border-color);
          height: fit-content;
          position: sticky;
          top: var(--spacing-xl);
        }

        .panel-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--border-color);
        }

        .panel-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .info-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 1rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .id-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          word-break: break-all;
          font-family: monospace;
        }

        .loading {
          text-align: center;
          padding: var(--spacing-2xl);
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        @media (max-width: 1200px) {
          .graph-section {
            grid-template-columns: 1fr;
          }

          .node-info-panel {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .graph-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
        </main>
    );
}
