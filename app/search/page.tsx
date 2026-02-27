'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DOMAINS, SKILL_TYPE_LABELS } from '../lib/constants';
import { DomainKey, SkillType } from '../lib/types';

interface Skill {
  id: string;
  label: string;
  type: SkillType;
  domain: DomainKey[];
  description: string;
}

interface SearchFilters {
  domains: DomainKey[];
  types: SkillType[];
  smartFactoryFocus: boolean;
}

interface SearchResponse {
  success: boolean;
  data: Skill[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    facets: {
      domains: Record<DomainKey, number>;
      types: Record<SkillType, number>;
    };
  };
}

const DOMAIN_LABELS = DOMAINS.reduce<Record<DomainKey, string>>((acc, domain) => {
  acc[domain.key] = domain.name;
  return acc;
}, {} as Record<DomainKey, string>);

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [facets, setFacets] = useState<SearchResponse['meta']['facets'] | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    domains: [],
    types: [],
    smartFactoryFocus: true,
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (searchQuery: string, searchFilters: SearchFilters, searchOffset = 0) => {
    if (
      !searchQuery.trim() &&
      searchFilters.domains.length === 0 &&
      searchFilters.types.length === 0 &&
      !searchFilters.smartFactoryFocus
    ) {
      setResults([]);
      setTotal(0);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          filters: searchFilters,
          limit: 20,
          offset: searchOffset,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();

      if (searchOffset === 0) {
        setResults(data.data);
      } else {
        setResults((prev) => [...prev, ...data.data]);
      }

      setTotal(data.meta.total);
      setHasMore(data.meta.hasMore);
      setFacets(data.meta.facets);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setOffset(0);
      search(query, filters, 0);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, filters, search]);

  const toggleFilter = (type: keyof SearchFilters, value: string) => {
    setFilters((prev) => {
      if (type === 'smartFactoryFocus') {
        return { ...prev, [type]: !prev[type] };
      }
      const current = prev[type] as (DomainKey | SkillType)[];
      const updated = current.includes(value as never)
        ? current.filter((v) => v !== (value as never))
        : [...current, value as never];
      return { ...prev, [type]: updated };
    });
    setOffset(0);
  };

  const clearFilters = () => {
    setFilters((prev) => ({
      domains: [],
      types: [],
      smartFactoryFocus: prev.smartFactoryFocus,
    }));
    setOffset(0);
  };

  const toggleSmartFactoryFocus = (enabled: boolean) => {
    setFilters((prev) => ({
      ...prev,
      smartFactoryFocus: enabled,
    }));
    setOffset(0);
  };

  const loadMore = () => {
    const newOffset = offset + 20;
    setOffset(newOffset);
    search(query, filters, newOffset);
  };

  const activeFiltersCount = filters.domains.length + filters.types.length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
          Smart Factory Robotics Search
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Search ESCO-based skills for smart factory robotics.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by skill name or description..."
            style={{
              width: '100%',
              padding: '1.25rem 1.5rem',
              paddingLeft: '8rem',
              fontSize: '1.1rem',
              borderRadius: '12px',
              border: '2px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '1.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Search
          </span>
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        <div>
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Smart Factory Focus</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Boost PLC/SCADA/MES, integration, safety, and automation skills.
                </div>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={filters.smartFactoryFocus}
                  onChange={(e) => toggleSmartFactoryFocus(e.target.checked)}
                />
                <span style={{ fontSize: '0.9rem' }}>{filters.smartFactoryFocus ? 'On' : 'Off'}</span>
              </label>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Clear ({activeFiltersCount})
                </button>
              )}
            </div>

            {facets && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Domains
                  </h4>
                  {Object.entries(facets.domains).map(([domain, count]) => (
                    <label
                      key={domain}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        background: filters.domains.includes(domain as DomainKey) ? 'var(--color-primary)22' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={filters.domains.includes(domain as DomainKey)}
                          onChange={() => toggleFilter('domains', domain)}
                        />
                        <span>{DOMAIN_LABELS[domain as DomainKey] || domain}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{count}</span>
                    </label>
                  ))}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    Types
                  </h4>
                  {Object.entries(facets.types).map(([type, count]) => (
                    <label
                      key={type}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        background: filters.types.includes(type as SkillType) ? 'var(--color-primary)22' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type as SkillType)}
                          onChange={() => toggleFilter('types', type)}
                        />
                        <span>{SKILL_TYPE_LABELS[type as SkillType] || type}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{count}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          {loading && results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Searching...</div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading results</p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>No results</div>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting filters or search terms.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Total {total} results</div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {results.map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid var(--border-color)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}
                    >
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{skill.label}</h3>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: 'var(--color-primary)22',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {SKILL_TYPE_LABELS[skill.type] || skill.type}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{skill.description}</p>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {skill.domain.map((d) => (
                        <span
                          key={d}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {DOMAIN_LABELS[d] || d}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    style={{
                      padding: '1rem 2rem',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {loading ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
