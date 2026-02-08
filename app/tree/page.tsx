'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/LoadingSpinner';
import { loadRobotSolutionData, getEnrichedSkills } from '../lib/org-skills-data';
import { createTreeData, getTreeStats, searchTree, type TreeData, type TreeNode } from '../lib/tree-data';

const SkillTree = dynamic(() => import('../components/SkillTree'), {
  ssr: false,
  loading: () => <LoadingSpinner text="트리 로딩 중..." />
});

export default function TreePage() {
  const [treeData, setTreeData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TreeNode[]>([]);
  const [treeWidth, setTreeWidth] = useState(1200);
  const [treeHeight, setTreeHeight] = useState(800);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await loadRobotSolutionData();
        const skills = await getEnrichedSkills(data);

        const tree = createTreeData(
          '로봇솔루션 Task Force',
          data.enablers,
          skills
        );

        setTreeData(tree);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load tree data:', error);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    // Set tree dimensions on client side only
    if (typeof window !== 'undefined') {
      setTreeWidth(window.innerWidth - 100);
      setTreeHeight(window.innerHeight - 300);

      const handleResize = () => {
        setTreeWidth(window.innerWidth - 100);
        setTreeHeight(window.innerHeight - 300);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (!treeData || !searchQuery) {
      setSearchResults([]);
      return;
    }

    const results = searchTree(treeData, searchQuery);
    setSearchResults(results);
  }, [searchQuery, treeData]);

  const handleNodeClick = (nodeData: any) => {
    setSelectedNode(nodeData);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="tree-page">
        <LoadingSpinner text="스킬 트리 로딩 중..." />
        <style jsx>{styles}</style>
      </div>
    );
  }

  const stats = treeData ? getTreeStats(treeData) : null;

  return (
    <div className="tree-page">
      <div className="page-header">
        <h1 className="page-title">🌳 스킬 트리 뷰</h1>
        <p className="page-description">
          조직의 스킬을 계층적 구조로 시각화합니다
        </p>
      </div>

      <div className="controls-panel">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="스킬 검색..."
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.length}개 결과 찾음
            </div>
          )}
        </div>

        {stats && (
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-label">총 노드</div>
              <div className="stat-value">{stats.totalNodes}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Enabler</div>
              <div className="stat-value">{stats.enablerNodes}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">스킬</div>
              <div className="stat-value">{stats.skillNodes}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">최대 깊이</div>
              <div className="stat-value">{stats.maxDepth}</div>
            </div>
          </div>
        )}
      </div>

      <div className="tree-container">
        {treeData && (
          <SkillTree
            data={treeData}
            width={treeWidth}
            height={treeHeight}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>

      {selectedNode && (
        <div className="node-details">
          <div className="details-header">
            <h3>
              {selectedNode.attributes?.type === 'organization' && '🏢 조직'}
              {selectedNode.attributes?.type === 'enabler' && '🎯 Enabler'}
              {selectedNode.attributes?.type === 'skill-type' && '📂 타입'}
              {selectedNode.attributes?.type === 'skill' && '📚 스킬'}
            </h3>
            <button onClick={() => setSelectedNode(null)}>✕</button>
          </div>
          <div className="details-content">
            <div className="detail-item">
              <span className="detail-label">이름:</span>
              <span className="detail-value">{selectedNode.name}</span>
            </div>

            {selectedNode.attributes?.type === 'enabler' && (
              <>
                <div className="detail-item">
                  <span className="detail-label">Priority:</span>
                  <span className="detail-value">P{selectedNode.attributes.priority}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">스킬 수:</span>
                  <span className="detail-value">{selectedNode.attributes.skillCount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">설명:</span>
                  <span className="detail-value">{selectedNode.attributes.description}</span>
                </div>
              </>
            )}

            {selectedNode.attributes?.type === 'skill' && (
              <>
                <div className="detail-item">
                  <span className="detail-label">영문명:</span>
                  <span className="detail-value">{selectedNode.attributes.englishLabel}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">중요도:</span>
                  <span className="detail-value">{'⭐'.repeat(selectedNode.attributes.importance || 1)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">목표 숙련도:</span>
                  <span className="detail-value">{selectedNode.attributes.proficiency}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">매칭 타입:</span>
                  <span className="detail-value">{selectedNode.attributes.matchType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">URI:</span>
                  <span className="detail-value" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {selectedNode.attributes.uri}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="legend">
        <h4>범례</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#6C5CE7', width: '20px', height: '20px' }}></div>
            <span>조직</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#FF6B6B', width: '15px', height: '15px' }}></div>
            <span>Enabler (Priority별 색상)</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#4ECDC4', width: '12px', height: '12px' }}></div>
            <span>지식 (Knowledge)</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#FFA500', width: '12px', height: '12px' }}></div>
            <span>역량 (Skill/Competence)</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ background: '#95E1D3', width: '10px', height: '10px' }}></div>
            <span>스킬 (중요도별 크기/색상)</span>
          </div>
        </div>
        <div className="legend-note">
          💡 노드를 클릭하여 확장/축소할 수 있습니다
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
    .tree-page {
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

    .search-section {
        margin-bottom: var(--spacing-lg);
    }

    .search-input {
        width: 100%;
        padding: var(--spacing-md);
        border: 2px solid var(--border-color);
        border-radius: var(--radius-md);
        font-size: 1rem;
        background: var(--bg-tertiary);
        color: var(--text-primary);
        transition: all var(--transition-base);
    }

    .search-input:focus {
        outline: none;
        border-color: var(--color-primary);
        background: var(--bg-primary);
    }

    .search-results {
        margin-top: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: var(--color-primary)22;
        border-radius: var(--radius-sm);
        color: var(--color-primary);
        font-size: 0.9rem;
        font-weight: 600;
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

    .tree-container {
        background: #f8f9fa;
        border-radius: var(--radius-lg);
        overflow: hidden;
        margin-bottom: var(--spacing-xl);
        border: 2px solid var(--border-color);
        min-height: 600px;
    }

    .node-details {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--bg-card);
        border: 2px solid var(--color-primary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-height: 80vh;
        overflow-y: auto;
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
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .detail-label {
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 0.85rem;
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
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
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

    .legend-note {
        padding: var(--spacing-sm);
        background: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        font-size: 0.85rem;
        text-align: center;
    }

    .loading {
        text-align: center;
        padding: var(--spacing-2xl);
        font-size: 1.2rem;
        color: var(--text-secondary);
    }

    @media (max-width: 768px) {
        .tree-page {
            padding: var(--spacing-md);
        }

        .stats-section {
            grid-template-columns: repeat(2, 1fr);
        }

        .node-details {
            left: 10px;
            right: 10px;
            bottom: 10px;
            max-width: none;
        }

        .legend-items {
            grid-template-columns: 1fr;
        }
    }
`;
