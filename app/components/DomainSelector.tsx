"use client";

import { DomainKey } from '../lib/types';
import { DOMAINS } from '../lib/constants';

interface DomainSelectorProps {
    selectedDomains: DomainKey[];
    onDomainChange: (domains: DomainKey[]) => void;
    maxSelections?: number;
}

export default function DomainSelector({
    selectedDomains,
    onDomainChange,
    maxSelections = 3
}: DomainSelectorProps) {
    const handleDomainToggle = (domainKey: DomainKey) => {
        if (selectedDomains.includes(domainKey)) {
            // 선택 해제
            onDomainChange(selectedDomains.filter(d => d !== domainKey));
        } else {
            // 선택 추가 (최대 개수 제한)
            if (selectedDomains.length < maxSelections) {
                onDomainChange([...selectedDomains, domainKey]);
            }
        }
    };

    return (
        <div className="domain-selector">
            <div className="selector-header">
                <h3 className="selector-title">Select Domains to Compare</h3>
                <p className="selector-description">
                    Choose up to {maxSelections} domains ({selectedDomains.length}/{maxSelections} selected)
                </p>
            </div>

            <div className="domains-grid">
                {DOMAINS.map((domain) => {
                    const isSelected = selectedDomains.includes(domain.key);
                    const isDisabled = !isSelected && selectedDomains.length >= maxSelections;

                    return (
                        <button
                            key={domain.key}
                            className={`domain-button ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => handleDomainToggle(domain.key)}
                            disabled={isDisabled}
                        >
                            <span className="domain-icon">{domain.icon}</span>
                            <span className="domain-name">{domain.name}</span>
                            {isSelected && <span className="check-icon">✓</span>}
                        </button>
                    );
                })}
            </div>

            {selectedDomains.length >= 2 && (
                <div className="selection-summary">
                    <strong>Comparing:</strong> {selectedDomains.map(key =>
                        DOMAINS.find(d => d.key === key)?.name
                    ).join(' vs ')}
                </div>
            )}

            <style jsx>{`
        .domain-selector {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }

        .selector-header {
          margin-bottom: var(--spacing-lg);
        }

        .selector-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .selector-description {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .domains-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .domain-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md) var(--spacing-lg);
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          position: relative;
        }

        .domain-button:hover:not(.disabled) {
          background: var(--bg-secondary);
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .domain-button.selected {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          border-color: var(--color-primary);
          color: white;
        }

        .domain-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .domain-icon {
          font-size: 1.5rem;
        }

        .domain-name {
          flex-grow: 1;
          font-weight: 600;
          text-align: left;
        }

        .check-icon {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .selection-summary {
          padding: var(--spacing-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--color-primary);
          color: var(--text-secondary);
        }

        .selection-summary strong {
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .domains-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
