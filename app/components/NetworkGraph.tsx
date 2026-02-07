"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, GraphNode, GraphLink } from '../lib/network-graph';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false
});

interface NetworkGraphProps {
    data: GraphData;
    width?: number;
    height?: number;
    onNodeClick?: (node: GraphNode) => void;
}

export default function NetworkGraph({
    data,
    width = 800,
    height = 600,
    onNodeClick
}: NetworkGraphProps) {
    const graphRef = useRef<any>();
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

    useEffect(() => {
        // 그래프 초기화 시 줌 조정
        if (graphRef.current) {
            graphRef.current.zoomToFit(400);
        }
    }, [data]);

    const handleNodeHover = (node: any) => {
        setHoverNode(node);

        if (!node) {
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
            return;
        }

        const neighbors = new Set<string>();
        const links = new Set<GraphLink>();

        data.links.forEach(link => {
            const source = typeof link.source === 'object' ? (link.source as any).id : link.source;
            const target = typeof link.target === 'object' ? (link.target as any).id : link.target;

            if (source === node.id) {
                neighbors.add(target);
                links.add(link);
            } else if (target === node.id) {
                neighbors.add(source);
                links.add(link);
            }
        });

        neighbors.add(node.id);
        setHighlightNodes(neighbors);
        setHighlightLinks(links);
    };

    const handleNodeClick = (node: any) => {
        if (onNodeClick) {
            onNodeClick(node);
        }
    };

    const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.label;
        const fontSize = node.type === 'domain' ? 14 : 10;
        const isHighlighted = highlightNodes.has(node.id);

        // 노드 그리기
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size || 5, 0, 2 * Math.PI);
        ctx.fillStyle = isHighlighted ? node.color : `${node.color}88`;
        ctx.fill();

        // 테두리
        if (isHighlighted) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 라벨
        if (isHighlighted || node.type === 'domain') {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, node.x, node.y + (node.size || 5) + 12);
        }
    };

    const paintLink = (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const isHighlighted = highlightLinks.has(link);

        ctx.strokeStyle = isHighlighted ? '#ffffff' : '#ffffff33';
        ctx.lineWidth = isHighlighted ? 2 : 1;

        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();
    };

    return (
        <div className="network-graph-container">
            <ForceGraph2D
                ref={graphRef}
                graphData={data}
                width={width}
                height={height}
                nodeCanvasObject={paintNode}
                linkCanvasObject={paintLink}
                onNodeHover={handleNodeHover}
                onNodeClick={handleNodeClick}
                nodeRelSize={6}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={(link: any) =>
                    highlightLinks.has(link) ? 4 : 0
                }
                backgroundColor="#0f0f1e"
                cooldownTicks={100}
                onEngineStop={() => graphRef.current?.zoomToFit(400)}
            />

            {hoverNode && (
                <div className="node-tooltip">
                    <div className="tooltip-header">
                        <span className="tooltip-type">{hoverNode.type === 'domain' ? '📂' : '⚡'}</span>
                        <strong>{hoverNode.label}</strong>
                    </div>
                    {hoverNode.type === 'skill' && (
                        <div className="tooltip-details">
                            <div className="tooltip-row">
                                <span className="tooltip-label">Type:</span>
                                <span className="tooltip-value">
                                    {hoverNode.skillType === 'knowledge' ? 'Knowledge' : 'Competence'}
                                </span>
                            </div>
                            {hoverNode.domain && (
                                <div className="tooltip-row">
                                    <span className="tooltip-label">Domain:</span>
                                    <span className="tooltip-value">{hoverNode.domain}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
        .network-graph-container {
          position: relative;
          background: #0f0f1e;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .node-tooltip {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(26, 26, 46, 0.95);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          min-width: 200px;
          backdrop-filter: blur(10px);
          z-index: 10;
        }

        .tooltip-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .tooltip-type {
          font-size: 1.5rem;
        }

        .tooltip-details {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          font-size: 0.9rem;
        }

        .tooltip-row {
          display: flex;
          justify-content: space-between;
          gap: var(--spacing-md);
        }

        .tooltip-label {
          color: var(--text-muted);
        }

        .tooltip-value {
          color: var(--text-secondary);
          font-weight: 600;
        }
      `}</style>
        </div>
    );
}
