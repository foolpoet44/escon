"use client";

import { useState } from 'react';

export interface Enabler {
    id: string;
    name: string;
    name_en: string;
    skillCount: number;
    priority: number;
}

interface EnablerFilterProps {
    enablers: Enabler[];
    selectedEnablers: string[];
    onFilterChange: (enablerIds: string[]) => void;
}

export default function EnablerFilter({
    enablers,
    selectedEnablers,
    onFilterChange
}: EnablerFilterProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleEnabler = (enablerId: string) => {
        const newSelection = selectedEnablers.includes(enablerId)
            ? selectedEnablers.filter(id => id !== enablerId)
            : [...selectedEnablers, enablerId];
        onFilterChange(newSelection);
    };

    const selectAll = () => {
        onFilterChange(enablers.map(e => e.id));
    };

    const clearAll = () => {
        onFilterChange([]);
    };

    const selectedCount = selectedEnablers.length;
    const totalCount = enablers.length;

    return (
        <div className="enabler-filter">
            {/* Header */}
            <div className="filter-header">
                <div className="filter-title-section">
                    <h3 className="filter-title">
                        🎯 Enabler 필터
                    </h3>
                    <span className="filter-count">
                        {selectedCount} / {totalCount} 선택됨
                    </span>
                </div>

                <button
                    className="toggle-button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? "필터 접기" : "필터 펼치기"}
                >
                    {isExpanded ? '▼' : '▶'}
                </button>
            </div>

            {/* Filter content */}
            {isExpanded && (
                <div className="filter-content">
                    {/* Quick actions */}
                    <div className="quick-actions">
                        <button
                            className="action-button"
                            onClick={selectAll}
                            disabled={selectedCount === totalCount}
                        >
                            전체 선택
                        </button>
                        <button
                            className="action-button"
                            onClick={clearAll}
                            disabled={selectedCount === 0}
                        >
                            선택 해제
                        </button>
                    </div>

                    {/* Filter buttons */}
                    <div className="filter-buttons">
                        {enablers
                            .sort((a, b) => a.priority - b.priority)
                            .map(enabler => {
                                const isSelected = selectedEnablers.includes(enabler.id);
                                const priorityColor = getPriorityColor(enabler.priority);

                                return (
                                    <button
                                        key={enabler.id}
                                        className={`filter-btn ${isSelected ? 'active' : ''}`}
                                        onClick={() => toggleEnabler(enabler.id)}
                                        style={{
                                            '--btn-color': priorityColor,
                                        } as React.CSSProperties}
                                    >
                                        <div className="btn-content">
                                            <span className="btn-priority">P{enabler.priority}</span>
                                            <span className="btn-name">{enabler.name}</span>
                                            <span className="btn-count">{enabler.skillCount}</span>
                                        </div>
                                        {isSelected && <span className="check-icon">✓</span>}
                                    </button>
                                );
                            })}
                    </div>
                </div>
            )}

            <style jsx>{`
        .enabler-filter {
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        /* Header */
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--spacing-md);
        }

        .filter-title-section {
          display: flex;
          align-items: baseline;
          gap: var(--spacing-md);
          flex-grow: 1;
        }

        .filter-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .filter-count {
          font-size: 0.9rem;
          color: var(--text-muted);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }

        .toggle-button {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: var(--spacing-sm);
          cursor: pointer;
          color: var(--text-secondary);
          transition: all var(--transition-base);
          font-size: 0.9rem;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-button:hover {
          background: var(--bg-tertiary);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        /* Content */
        .filter-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--border-color);
        }

        /* Quick actions */
        .quick-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .action-button {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .action-button:hover:not(:disabled) {
          background: var(--bg-tertiary);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Filter buttons */
        .filter-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-sm);
        }

        .filter-btn {
          position: relative;
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: left;
          overflow: hidden;
        }

        .filter-btn::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--btn-color);
          transform: scaleY(0);
          transition: transform var(--transition-base);
        }

        .filter-btn:hover::before,
        .filter-btn.active::before {
          transform: scaleY(1);
        }

        .filter-btn:hover {
          border-color: var(--btn-color);
          background: var(--bg-tertiary);
          transform: translateX(4px);
        }

        .filter-btn.active {
          border-color: var(--btn-color);
          background: var(--bg-tertiary);
          box-shadow: 0 2px 12px var(--btn-color)22;
        }

        .btn-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .btn-priority {
          font-size: 0.75rem;
          font-weight: 700;
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--btn-color)22;
          color: var(--btn-color);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          flex-grow: 1;
        }

        .btn-count {
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--bg-primary);
          border-radius: var(--radius-sm);
        }

        .check-icon {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          font-size: 1.2rem;
          color: var(--btn-color);
          animation: checkPop 0.3s ease;
        }

        @keyframes checkPop {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .filter-buttons {
            grid-template-columns: 1fr;
          }

          .filter-title-section {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-xs);
          }

          .quick-actions {
            flex-direction: column;
          }

          .action-button {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}

// Priority color helper
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
