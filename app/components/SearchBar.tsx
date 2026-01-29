'use client';

import { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search skills...' }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                className="search-input"
            />
            {query && (
                <button onClick={handleClear} className="clear-button" aria-label="Clear search">
                    ✕
                </button>
            )}

            <style jsx>{`
        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-sm) var(--spacing-md);
          transition: all var(--transition-base);
        }

        .search-bar:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
        }

        .search-icon {
          font-size: 1.2rem;
          margin-right: var(--spacing-sm);
          color: var(--text-muted);
        }

        .search-input {
          flex-grow: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 1rem;
          padding: var(--spacing-xs) 0;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .clear-button {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: var(--spacing-xs);
          font-size: 1.2rem;
          line-height: 1;
          transition: all var(--transition-fast);
          border-radius: var(--radius-sm);
        }

        .clear-button:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
      `}</style>
        </div>
    );
}
