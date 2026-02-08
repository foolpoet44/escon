'use client';

import { DomainKey } from '../lib/types';
import { DOMAINS } from '../lib/constants';

interface DomainSelectorProps {
  selectedDomain1: DomainKey | '';
  selectedDomain2: DomainKey | '';
  onSelectDomain1: (key: DomainKey) => void;
  onSelectDomain2: (key: DomainKey) => void;
}

export default function DomainSelector({
  selectedDomain1,
  selectedDomain2,
  onSelectDomain1,
  onSelectDomain2
}: DomainSelectorProps) {
  return (
    <div className="domain-selector-container">
      <div className="selector-group">
        <label className="selector-label">도메인 1</label>
        <select
          className="selector-input"
          value={selectedDomain1}
          onChange={(e) => onSelectDomain1(e.target.value as DomainKey)}
        >
          <option value="" disabled>도메인 선택</option>
          {DOMAINS.map((domain) => (
            <option key={`d1-${domain.key}`} value={domain.key}>
              {domain.name}
            </option>
          ))}
        </select>
      </div>

      <div className="vs-badge">VS</div>

      <div className="selector-group">
        <label className="selector-label">도메인 2</label>
        <select
          className="selector-input"
          value={selectedDomain2}
          onChange={(e) => onSelectDomain2(e.target.value as DomainKey)}
        >
          <option value="" disabled>도메인 선택</option>
          {DOMAINS.map((domain) => (
            <option key={`d2-${domain.key}`} value={domain.key} disabled={domain.key === selectedDomain1}>
              {domain.name}
            </option>
          ))}
        </select>
      </div>

      <style jsx>{`
                .domain-selector-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    padding: 1.5rem;
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                    margin-bottom: 2rem;
                    box-shadow: var(--shadow-sm);
                }
                
                .selector-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex: 1;
                    max-width: 300px;
                }
                
                .selector-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-left: 0.25rem;
                }
                
                .selector-input {
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background-color: var(--bg-tertiary);
                    font-size: 1rem;
                    color: var(--text-primary);
                    transition: all var(--transition-base);
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.75rem center;
                    background-repeat: no-repeat;
                    background-size: 1.25em 1.25em;
                }
                
                .selector-input:hover {
                    border-color: var(--text-secondary);
                }
                
                .selector-input:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
                }

                .vs-badge {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #fbbf24;
                    background-color: #78350f;
                    padding: 0.5rem;
                    border-radius: 50%;
                    width: 3rem;
                    height: 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: var(--shadow-md);
                    margin-top: 1.5rem;
                    border: 2px solid #fbbf24;
                }

                @media (max-width: 640px) {
                    .domain-selector-container {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .vs-badge {
                        margin-top: 0;
                        transform: rotate(90deg);
                    }
                    .selector-group {
                        max-width: 100%;
                        width: 100%;
                    }
                }
            `}</style>
    </div>
  );
}
