"use client";

import { useCallback, useState } from 'react';
import Tree from 'react-d3-tree';
import { TreeNode } from '../lib/skill-tree';

interface SkillTreeProps {
    data: TreeNode;
    width?: number;
    height?: number;
}

export default function SkillTree({ data, width = 1200, height = 800 }: SkillTreeProps) {
    const [selectedNode, setSelectedNode] = useState<any>(null);

    // 노드 클릭 핸들러
    const handleNodeClick = useCallback((nodeData: any) => {
        setSelectedNode(nodeData);
    }, []);

    // 노드 스타일 커스터마이징
    const getNodeColor = (nodeData: any) => {
        const type = nodeData.attributes?.type;
        switch (type) {
            case 'root':
                return '#667eea';
            case 'domain':
                return '#4ECDC4';
            case 'skill-group':
                return '#98D8C8';
            case 'knowledge':
                return '#98D8C8';
            case 'skill/competence':
                return '#667eea';
            case 'skill-type':
                return '#F6AD55';
            default:
                return '#aaa';
        }
    };

    const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
        const nodeColor = getNodeColor(nodeDatum);
        const isSelected = selectedNode?.name === nodeDatum.name;
        const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;

        return (
            <g>
                {/* 노드 원 */}
                <circle
                    r={hasChildren ? 12 : 8}
                    fill={nodeColor}
                    stroke={isSelected ? '#ffffff' : nodeColor}
                    strokeWidth={isSelected ? 3 : 1}
                    onClick={() => {
                        handleNodeClick(nodeDatum);
                        if (hasChildren) toggleNode();
                    }}
                    style={{ cursor: 'pointer' }}
                />

                {/* 노드 라벨 */}
                <text
                    fill="#ffffff"
                    strokeWidth="0"
                    x={20}
                    y={5}
                    style={{
                        fontSize: hasChildren ? '14px' : '12px',
                        fontWeight: hasChildren ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        handleNodeClick(nodeDatum);
                        if (hasChildren) toggleNode();
                    }}
                >
                    {nodeDatum.name}
                </text>

                {/* 카운트 표시 */}
                {nodeDatum.attributes?.count && (
                    <text
                        fill="#aaa"
                        strokeWidth="0"
                        x={20}
                        y={20}
                        style={{ fontSize: '10px' }}
                    >
                        ({nodeDatum.attributes.count} items)
                    </text>
                )}
            </g>
        );
    };

    return (
        <div className="skill-tree-container">
            <div className="tree-wrapper">
                <Tree
                    data={data}
                    orientation="vertical"
                    pathFunc="step"
                    translate={{ x: width / 2, y: 50 }}
                    nodeSize={{ x: 200, y: 150 }}
                    renderCustomNodeElement={renderCustomNode}
                    separation={{ siblings: 1, nonSiblings: 1.5 }}
                    zoom={0.8}
                    enableLegacyTransitions
                    transitionDuration={500}
                    collapsible={true}
                    initialDepth={2}
                    depthFactor={150}
                />
            </div>

            {selectedNode && (
                <div className="node-details-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">{selectedNode.name}</h3>
                        <button
                            className="close-button"
                            onClick={() => setSelectedNode(null)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="panel-content">
                        {selectedNode.attributes?.type && (
                            <div className="detail-row">
                                <span className="detail-label">Type:</span>
                                <span className="detail-value">{selectedNode.attributes.type}</span>
                            </div>
                        )}

                        {selectedNode.attributes?.count !== undefined && (
                            <div className="detail-row">
                                <span className="detail-label">Count:</span>
                                <span className="detail-value">{selectedNode.attributes.count}</span>
                            </div>
                        )}

                        {selectedNode.attributes?.description && (
                            <div className="detail-row">
                                <span className="detail-label">Description:</span>
                                <p className="detail-description">{selectedNode.attributes.description}</p>
                            </div>
                        )}

                        {selectedNode.attributes?.uri && (
                            <div className="detail-row">
                                <span className="detail-label">URI:</span>
                                <code className="detail-uri">{selectedNode.attributes.uri}</code>
                            </div>
                        )}

                        {selectedNode.children && selectedNode.children.length > 0 && (
                            <div className="detail-row">
                                <span className="detail-label">Children:</span>
                                <span className="detail-value">{selectedNode.children.length}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
        .skill-tree-container {
          position: relative;
          background: #0f0f1e;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .tree-wrapper {
          width: ${width}px;
          height: ${height}px;
        }

        .node-details-panel {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 320px;
          max-height: calc(100% - 40px);
          background: rgba(26, 26, 46, 0.95);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          backdrop-filter: blur(10px);
          overflow-y: auto;
          z-index: 10;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--border-color);
        }

        .panel-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          flex-grow: 1;
          padding-right: var(--spacing-sm);
        }

        .close-button {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color var(--transition-base);
        }

        .close-button:hover {
          color: var(--text-primary);
        }

        .panel-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .detail-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .detail-value {
          font-size: 1rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .detail-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .detail-uri {
          font-size: 0.85rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          word-break: break-all;
          display: block;
        }

        /* 스크롤바 스타일 */
        .node-details-panel::-webkit-scrollbar {
          width: 6px;
        }

        .node-details-panel::-webkit-scrollbar-track {
          background: transparent;
        }

        .node-details-panel::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }

        .node-details-panel::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary);
        }
      `}</style>
        </div>
    );
}
