'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
    chart: string;
    id: string;
}

export default function MermaidChart({ chart, id }: MermaidChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            themeVariables: {
                primaryColor: '#667eea',
                primaryTextColor: '#fff',
                primaryBorderColor: '#8b5cf6',
                lineColor: '#6366f1',
                secondaryColor: '#4ecdc4',
                tertiaryColor: '#f8b739',
                background: '#1a1a2e',
                mainBkg: '#16213e',
                secondBkg: '#0f3460',
                textColor: '#e2e8f0',
                fontSize: '16px'
            }
        });

        if (containerRef.current) {
            containerRef.current.innerHTML = chart;
            mermaid.contentLoaded();
        }
    }, [chart]);

    return (
        <div className="mermaid-container">
            <div ref={containerRef} className="mermaid" id={id} />

            <style jsx>{`
        .mermaid-container {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          overflow-x: auto;
        }

        .mermaid-container :global(svg) {
          max-width: 100%;
          height: auto;
        }
      `}</style>
        </div>
    );
}
