'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useCollaboration } from '../lib/collaboration';
import LoadingSpinner from './LoadingSpinner';

interface CollaborativeNetworkGraphProps {
  roomId: string;
  userName: string;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const INITIAL_DATA: GraphData = {
  nodes: [
    { id: 'robotics', name: '로보틱스', val: 20, color: '#FF6B6B' },
    { id: 'ai', name: 'AI/ML', val: 20, color: '#4ECDC4' },
    { id: 'python', name: 'Python', val: 15, color: '#FFA500' },
    { id: 'ros', name: 'ROS', val: 15, color: '#9B59B6' },
    { id: 'opencv', name: 'OpenCV', val: 10, color: '#3498DB' },
    { id: 'tensorflow', name: 'TensorFlow', val: 10, color: '#E74C3C' },
  ],
  links: [
    { source: 'robotics', target: 'ros' },
    { source: 'robotics', target: 'python' },
    { source: 'ai', target: 'python' },
    { source: 'ai', target: 'tensorflow' },
    { source: 'robotics', target: 'opencv' },
    { source: 'ai', target: 'opencv' },
  ],
};

export default function CollaborativeNetworkGraph({
  roomId,
  userName,
}: CollaborativeNetworkGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>(INITIAL_DATA);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const fgRef = useRef<any>(null);

  const {
    connected,
    users,
    updateCursor,
    selectNode,
  } = useCollaboration({
    roomId,
    userName,
    onNodeSelection: (data) => {
      console.log('Node selection:', data);
    },
  });

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node.id);
    selectNode(node.id, true);
  }, [selectNode]);

  const handleBackgroundClick = useCallback(() => {
    if (selectedNode) {
      selectNode(selectedNode, false);
      setSelectedNode(null);
    }
  }, [selectedNode, selectNode]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect?.();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setCursorPos({ x, y });
      updateCursor(x, y, hoveredNode?.id);
    }
  }, [updateCursor, hoveredNode]);

  useEffect(() => {
    const container = document.getElementById('graph-container');
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseMove]);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2);

    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(
      node.x - bckgDimensions[0] / 2,
      node.y + node.val / 2 + 2,
      bckgDimensions[0],
      bckgDimensions[1]
    );

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText(label, node.x, node.y + node.val / 2 + 2 + fontSize / 2);

    if (selectedNode === node.id) {
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.val / 2 + 3, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }, [selectedNode]);

  return (
    <div style={{ height: 'calc(100vh - 80px)', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 10,
          background: 'var(--bg-card)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: connected ? '#2ECC71' : '#E74C3C',
            }}
          />
          <span style={{ fontWeight: 600 }}>
            {connected ? '연결됨' : '연결 중...'}
          </span>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          방: {roomId}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          사용자: {userName}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 10,
          background: 'var(--bg-card)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          maxWidth: '200px',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>참여자 ({users.length})</h3>
        {users.map((user) => (
          <div
            key={user.userId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: user.color,
              }}
            />
            <span style={{ fontSize: '0.9rem' }}>{user.userName}</span>
          </div>
        ))}
      </div>

      <div id="graph-container" style={{ width: '100%', height: '100%' }}>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeAutoColorBy="id"
          nodeCanvasObject={nodeCanvasObject}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          onNodeHover={(node) => setHoveredNode(node as GraphNode | null)}
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          warmupTicks={100}
          cooldownTicks={50}
        />
      </div>

      {users.map((user) => (
        <div
          key={user.userId}
          style={{
            position: 'absolute',
            left: user.x,
            top: user.y,
            pointerEvents: 'none',
            zIndex: 100,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={user.color}
          >
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z" />
          </svg>
          <span
            style={{
              position: 'absolute',
              left: '20px',
              top: '0',
              background: user.color,
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
          >
            {user.userName}
          </span>
        </div>
      ))}
    </div>
  );
}
