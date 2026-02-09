'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { loadRobotSolutionData, getEnrichedSkills } from '../lib/org-skills-data';
import { createGraphData, filterGraphByEnabler, getGraphStats, type GraphData, type GraphNode } from '../lib/graph-data';
import type { Enabler } from '../lib/types';

const NetworkGraph = dynamic(() => import('../components/NetworkGraph'), {
  ssr: false,
  loading: () => <LoadingSpinner text="그래프 로딩 중..." />
});

export default function NetworkPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [filteredGraphData, setFilteredGraphData] = useState<GraphData | null>(null);
  const [enablers, setEnablers] = useState<Enabler[]>([]);
  const [selectedEnablers, setSelectedEnablers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphWidth, setGraphWidth] = useState(1200);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadRobotSolutionData();
        const skills = await getEnrichedSkills(data);

        const graph = createGraphData(skills, data.enablers);
        setGraphData(graph);
        setFilteredGraphData(graph);
        setEnablers(data.enablers);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load graph data:', err);
        setError('그래프 데이터를 불러오는데 실패했습니다');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    // Set graph width on client side only
    if (typeof window !== 'undefined') {
      setGraphWidth(window.innerWidth - 100);

      const handleResize = () => {
        setGraphWidth(window.innerWidth - 100);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (!graphData) return;

    if (selectedEnablers.length === 0) {
      setFilteredGraphData(graphData);
    } else {
      const filtered = filterGraphByEnabler(graphData, selectedEnablers);
      setFilteredGraphData(filtered);
    }
  }, [selectedEnablers, graphData]);

  const handleEnablerToggle = (enablerId: string) => {
    setSelectedEnablers(prev => {
      if (prev.includes(enablerId)) {
        return prev.filter(id => id !== enablerId);
      } else {
        return [...prev, enablerId];
      }
    });
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  if (error) {
    return (
      <ErrorState 
        title="그래프를 불러올 수 없습니다"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (loading) {
    return (
      <div className="network-page">
        <LoadingSpinner text="네트워크 그래프 로딩 중..." />
        <style jsx>{styles}</style>
      </div>
    );
  }

  const stats = filteredGraphData ? getGraphStats(filteredGraphData) : null;

  return (
    <div className="network-page">
      <div className="page-header">
        <h1 className="page-title">🕸️ 스킬 네트워크 그래프</h1>
        <p className="page-description">
          스킬 간 관계를 인터랙티브 네트워크로 시각화합니다
        </p>
      </div>

      <div className="controls-panel">
        <div className="filter-section">
          <h3 className="filter-title">Enabler 필터</h3>
          <div className="enabler-filters">
            {enablers.map(enabler => (
              <button
                key={enabler.id}
                className={`enabler-filter-btn ${selectedEnablers.includes(enabler.id) ? 'active' : ''}`}
                onClick={() => handleEnablerToggle(enabler.id)}
                style={{
                  borderColor: selectedEnablers.includes(enabler.id) ? getPriorityColor(enabler.priority) : undefined,
                  backgroundColor: selectedEnablers.includes(enabler.id) ? `${getPriorityColor(enabler.priority)}22` : undefined,
                }}
              >
                <span className="priority-badge" style={{ background: getPriorityColor(enabler.priority) }}>
                  P{enabler.priority}
                </span>
                <span>{enabler.name}</span>
              </button>
            ))}
            {selectedEnablers.length > 0 && (
              <button
                className="clear-filter-btn"
                onClick={() => setSelectedEnablers([])}
              >
                전체 보기
              </button>
            )}
          </div>
        </div>

        {stats && (
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-label">노드</div>
              <div className="stat-value">{stats.totalNodes}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">스킬</div>
              <div className="stat-value">{stats.skillNodes}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">연결</div>
              <div className="stat-value">{stats.totalLinks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">평균 연결</div>
              <div className="stat-value">{stats.avgConnections.toFixed(1)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="graph-container">
        {filteredGraphData && (
          <NetworkGraph
            data={filteredGraphData}
            width={graphWidth}
            height={700}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>

      {selectedNode && (
        <div className="node-details">
          <div className="details-header">
            <h3>
              {selectedNode.type === 'enabler' ? '🎯 Enabler' : '📚 Skill'}
            </h3>
            <button onClick={() => setSelectedNode(null)}>✕</button>
          </div>
          <div className="details-content">
            <div className="detail-item">
              <span className="detail-label">이름:</span>
              <span className="detail-value">{selectedNode.label}</span>
            </div>
            {selectedNode.importance && (
              <div className="detail-item">
                <span className="detail-label">중요도:</span>
                <span className="detail-value">{'⭐'.repeat(selectedNode.importance)}</span>
              </div>
            )}
            {selectedNode.proficiency && (
              <div className="detail-item">
                <span className="detail-label">목표 숙련도:</span>
                <span className="detail-value">{selectedNode.proficiency}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">ID:</span>
              <span className="detail-value" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                {selectedNode.id}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="legend">
        <h4>범례</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#FF6B6B', width: '16px', height: '16px' }}></div>
            <span>Enabler</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#4ECDC4', width: '12px', height: '12px' }}></div>
            <span>Skill</span>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ background: '#4ECDC4' }}></div>
            <span>Enabler-Skill</span>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ background: '#95E1D3' }}></div>
            <span>Skill-Skill</span>
          </div>
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = {
    1: '#FF6B6B',
    2: '#FFA500',
    3: '#4ECDC4',
    4: '#45B7D1',
    5: '#95E1D3',
  };
  return colors[priority] || '#4ECDC4';
}

const styles = `
    .network-page {
        min-height: 100vh;
        background: var(--bg-primary);
        padding: var(--spacing-xl);
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

    .controls-panel {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
    }

    .filter-section {
        margin-bottom: var(--spacing-lg);
    }

    .filter-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
    }

    .enabler-filters {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
    }

    .enabler-filter-btn {
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

    .enabler-filter-btn:hover {
        transform: translateY(-2px);
    }

    .enabler-filter-btn.active {
        color: var(--text-primary);
    }

    .priority-badge {
        padding: 2px 6px;
        border-radius: 4px;
        color: white;
        font-size: 0.75rem;
        font-weight: 700;
    }

    .clear-filter-btn {
        padding: var(--spacing-sm) var(--spacing-md);
        background: transparent;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-base);
    }

    .clear-filter-btn:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }

    .stats-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--spacing-md);
    }

    .stat-card {
        background: var(--bg-tertiary);
        padding: var(--spacing-md);
        border-radius: var(--radius-md);
        text-align: center;
    }

    .stat-label {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-bottom: var(--spacing-xs);
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-primary);
    }

    .graph-container {
        background: #1a1a2e;
        border-radius: var(--radius-lg);
        overflow: hidden;
        margin-bottom: var(--spacing-xl);
        border: 2px solid var(--border-color);
    }

    .node-details {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: var(--bg-card);
        border: 2px solid var(--color-primary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .details-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-sm);
        border-bottom: 1px solid var(--border-color);
    }

    .details-header h3 {
        font-size: 1.25rem;
        color: var(--text-primary);
        margin: 0;
    }

    .details-header button {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all var(--transition-base);
    }

    .details-header button:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }

    .details-content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .detail-item {
        display: flex;
        gap: var(--spacing-sm);
    }

    .detail-label {
        font-weight: 600;
        color: var(--text-secondary);
        min-width: 100px;
    }

    .detail-value {
        color: var(--text-primary);
    }

    .legend {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
    }

    .legend h4 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
    }

    .legend-items {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-md);
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .legend-circle {
        border-radius: 50%;
        flex-shrink: 0;
    }

    .legend-line {
        width: 30px;
        height: 3px;
        flex-shrink: 0;
    }

    .loading {
        text-align: center;
        padding: var(--spacing-2xl);
        font-size: 1.2rem;
        color: var(--text-secondary);
    }

    @media (max-width: 768px) {
        .network-page {
            padding: var(--spacing-md);
        }

        .enabler-filters {
            flex-direction: column;
        }

        .stats-section {
            grid-template-columns: repeat(2, 1fr);
        }

        .node-details {
            left: 10px;
            right: 10px;
            max-width: none;
        }
    }
`;
