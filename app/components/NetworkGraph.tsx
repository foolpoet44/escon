'use client';

import { useEffect, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { GraphData, GraphNode, GraphLink } from '../lib/graph-data';

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
        // Auto-fit graph on data change
        if (graphRef.current) {
            graphRef.current.zoomToFit(400);
        }
    }, [data]);

    const handleNodeHover = (node: GraphNode | null) => {
        setHoverNode(node);

        if (!node) {
            setHighlightNodes(new Set());
            setHighlightLinks(new Set());
            return;
        }

        const neighbors = new Set<string>();
        const links = new Set<string>();

        data.links.forEach(link => {
            if (link.source === node.id || (typeof link.source === 'object' && (link.source as any).id === node.id)) {
                const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
                neighbors.add(targetId);
                links.add(`${node.id}-${targetId}`);
            }
            if (link.target === node.id || (typeof link.target === 'object' && (link.target as any).id === node.id)) {
                const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
                neighbors.add(sourceId);
                links.add(`${sourceId}-${node.id}`);
            }
        });

        neighbors.add(node.id);
        setHighlightNodes(neighbors);
        setHighlightLinks(links);
    };

    const handleNodeClick = (node: GraphNode) => {
        if (onNodeClick) {
            onNodeClick(node);
        }

        // Center on node
        if (graphRef.current) {
            const nodeWithCoords = node as any;
            graphRef.current.centerAt(nodeWithCoords.x, nodeWithCoords.y, 1000);
            graphRef.current.zoom(2, 1000);
        }
    };

    const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const isHighlighted = highlightNodes.has(node.id);
        const isHovered = hoverNode?.id === node.id;

        // Node size based on type and importance
        const baseSize = node.type === 'enabler' ? 8 : 5;
        const importanceMultiplier = node.importance ? 1 + (node.importance * 0.2) : 1;
        const size = baseSize * importanceMultiplier;

        // Node color
        let color = node.color || getNodeColor(node);
        if (!isHighlighted && highlightNodes.size > 0) {
            color = '#cccccc44';
        }

        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Draw border for highlighted/hovered nodes
        if (isHighlighted || isHovered) {
            ctx.strokeStyle = isHovered ? '#ffffff' : color;
            ctx.lineWidth = isHovered ? 3 : 2;
            ctx.stroke();
        }

        // Draw label for enabler nodes or hovered nodes
        if (node.type === 'enabler' || isHovered || globalScale > 1.5) {
            const label = node.label;
            const fontSize = node.type === 'enabler' ? 12 : 10;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Background for label
            const textWidth = ctx.measureText(label).width;
            const padding = 4;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(
                node.x - textWidth / 2 - padding,
                node.y + size + 2,
                textWidth + padding * 2,
                fontSize + padding
            );

            // Label text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, node.x, node.y + size + fontSize / 2 + 4);
        }
    };

    const paintLink = (link: any, ctx: CanvasRenderingContext2D) => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        const linkId = `${sourceId}-${targetId}`;
        const isHighlighted = highlightLinks.has(linkId);

        // Link color and width
        const color = link.type === 'enabler-skill' ? '#4ECDC4' : '#95E1D3';
        const width = link.type === 'enabler-skill' ? 2 : 1;

        ctx.strokeStyle = isHighlighted ? color : `${color}44`;
        ctx.lineWidth = isHighlighted ? width * 1.5 : width;

        // Draw link
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
                    highlightLinks.has(`${link.source.id}-${link.target.id}`) ? 2 : 0
                }
                d3VelocityDecay={0.3}
                cooldownTime={3000}
                backgroundColor="#1a1a2e"
            />
            {hoverNode && (
                <div style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    maxWidth: '300px'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{hoverNode.label}</div>
                    {hoverNode.type === 'enabler' && (
                        <div style={{ fontSize: '0.8em', color: '#aaa' }}>
                            Priority: {hoverNode.priority}<br />
                            Skills: {hoverNode.skillCount}
                        </div>
                    )}
                    {hoverNode.type === 'skill' && (
                        <div style={{ fontSize: '0.8em', color: '#aaa' }}>
                            Type: {(hoverNode.original as any)?.type || 'Skill'}<br />
                            Importance: {hoverNode.importance || '-'}<br />
                            Proficiency: {hoverNode.proficiency || '-'}
                        </div>
                    )}
                </div>
            )}

            <div className="zoom-controls">
                <button onClick={() => graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400)} title="Zoom In">➕</button>
                <button onClick={() => graphRef.current?.zoom(graphRef.current.zoom() / 1.2, 400)} title="Zoom Out">➖</button>
                <button onClick={() => graphRef.current?.zoomToFit(400, 50)} title="Fit to Screen">⤢</button>
            </div>

            <style jsx>{`
                .zoom-controls {
                    position: absolute;
                    bottom: 30px;
                    right: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    background: rgba(30, 41, 59, 0.7); /* Slate-800 with opacity */
                    padding: 8px;
                    border-radius: 12px;
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .zoom-controls button {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    color: #e2e8f0; /* Slate-200 */
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
                .zoom-controls button:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .zoom-controls button:active {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}

// Helper functions for node colors
function getNodeColor(node: any): string {
    if (node.type === 'enabler') {
        const priorityColors: Record<number, string> = {
            1: '#FF6B6B', // High priority
            2: '#FFA500',
            3: '#FFD93D',
            4: '#95E1D3',
            5: '#4ECDC4'  // Low priority
        };
        return priorityColors[node.priority] || '#4ECDC4';
    } else {
        // Skill node color based on type
        return node.group === 'knowledge' ? '#A8E6CF' : '#FFD3B6';
    }
}
