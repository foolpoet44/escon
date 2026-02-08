'use client';

import { useCallback, useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import type { TreeData, TreeNode } from '../lib/tree-data';

interface SkillTreeProps {
    data: TreeData;
    width?: number;
    height?: number;
    onNodeClick?: (node: any) => void;
}

export default function SkillTree({
    data,
    width = 800,
    height = 600,
    onNodeClick
}: SkillTreeProps) {
    const [translate, setTranslate] = useState({ x: width / 2, y: 50 });
    const [zoom, setZoom] = useState(0.8);

    const handleNodeClick = useCallback((nodeData: any) => {
        if (onNodeClick) {
            onNodeClick(nodeData);
        }
    }, [onNodeClick]);

    // Update translate on resize
    useEffect(() => {
        if (width) {
            setTranslate({ x: width / 2, y: 50 });
        }
    }, [width]);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 0.2, 2.5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 0.2, 0.3));
    }, []);

    const handleReset = useCallback(() => {
        setZoom(0.8);
        setTranslate({ x: width / 2, y: 50 });
    }, [width]);

    const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
        // ... (existing renderCustomNode logic - no changes here, just keeping context)
        const isOrganization = nodeDatum.attributes?.type === 'organization';
        const isEnabler = nodeDatum.attributes?.type === 'enabler';
        const isSkillType = nodeDatum.attributes?.type === 'skill-type';
        const isSkill = nodeDatum.attributes?.type === 'skill';

        // Node size and color
        let nodeSize = 10;
        let nodeColor = '#4ECDC4';
        let textColor = '#333';
        let fontSize = 14;

        if (isOrganization) {
            nodeSize = 20;
            nodeColor = '#6C5CE7';
            fontSize = 18;
        } else if (isEnabler) {
            nodeSize = 15;
            nodeColor = nodeDatum.nodeSvgShape?.shapeProps?.fill || '#FF6B6B';
            fontSize = 16;
        } else if (isSkillType) {
            nodeSize = 12;
            nodeColor = nodeDatum.nodeSvgShape?.shapeProps?.fill || '#4ECDC4';
            fontSize = 14;
        } else if (isSkill) {
            nodeSize = nodeDatum.nodeSvgShape?.shapeProps?.r || 10;
            nodeColor = nodeDatum.nodeSvgShape?.shapeProps?.fill || '#95E1D3';
            fontSize = 12;
        }

        return (
            <g>
                <circle
                    r={nodeSize}
                    fill={nodeColor}
                    stroke={nodeDatum.nodeSvgShape?.shapeProps?.stroke || '#333'}
                    strokeWidth={nodeDatum.nodeSvgShape?.shapeProps?.strokeWidth || 1}
                    onClick={toggleNode}
                    style={{ cursor: 'pointer' }}
                />
                <text
                    fill={textColor}
                    strokeWidth="0"
                    x={nodeSize + 10}
                    y={5}
                    fontSize={fontSize}
                    fontWeight={isOrganization || isEnabler ? 'bold' : 'normal'}
                    style={{ cursor: 'pointer' }}
                    onClick={toggleNode}
                >
                    {nodeDatum.name}
                </text>
                {isEnabler && nodeDatum.attributes && (
                    <text
                        fill="#666"
                        strokeWidth="0"
                        x={nodeSize + 10}
                        y={20}
                        fontSize={11}
                    >
                        {`P${nodeDatum.attributes.priority} • ${nodeDatum.attributes.skillCount} skills`}
                    </text>
                )}
                {isSkill && nodeDatum.attributes && (
                    <>
                        <text
                            fill="#666"
                            strokeWidth="0"
                            x={nodeSize + 10}
                            y={18}
                            fontSize={10}
                        >
                            {`⭐`.repeat(nodeDatum.attributes.importance || 1)}
                        </text>
                        <text
                            fill="#666"
                            strokeWidth="0"
                            x={nodeSize + 10}
                            y={30}
                            fontSize={9}
                        >
                            {nodeDatum.attributes.proficiency}
                        </text>
                    </>
                )}
                {nodeDatum.children && nodeDatum.children.length > 0 && (
                    <text
                        fill="#999"
                        strokeWidth="0"
                        x={0}
                        y={-nodeSize - 5}
                        fontSize={12}
                        textAnchor="middle"
                    >
                        {nodeDatum.__rd3t?.collapsed ? '▶' : '▼'}
                    </text>
                )}
            </g>
        );
    };

    return (
        <div style={{ width: '100%', height: '100%', background: '#f8f9fa', borderRadius: '8px', position: 'relative' }}>
            <Tree
                data={data}
                translate={translate}
                zoom={zoom}
                onNodeClick={handleNodeClick}
                renderCustomNodeElement={renderCustomNode}
                orientation="vertical"
                pathFunc="step"
                separation={{ siblings: 2, nonSiblings: 2.5 }}
                nodeSize={{ x: 250, y: 150 }}
                collapsible={true}
                initialDepth={2}
                zoomable={true}
                draggable={true}
                enableLegacyTransitions={true}
                transitionDuration={500}
                depthFactor={150}
            />

            <div className="tree-controls">
                <button onClick={handleZoomIn} title="Zoom In">➕</button>
                <button onClick={handleZoomOut} title="Zoom Out">➖</button>
                <button onClick={handleReset} title="Reset View">⤢</button>
            </div>

            <style jsx>{`
                .tree-controls {
                    position: absolute;
                    bottom: 30px;
                    right: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 8px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e2e8f0;
                }
                .tree-controls button {
                    background: white;
                    border: 1px solid #cbd5e1;
                    color: #475569;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    transition: all 0.2s ease;
                }
                .tree-controls button:hover {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                    color: #1e293b;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .tree-controls button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}
