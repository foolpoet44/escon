'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Skill {
  id: string;
  name: string;
  category: string;
  domain: string[];
  level: string;
}

interface SearchFilters {
  domains: string[];
  categories: string[];
  levels: string[];
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
      domains: Record<string, number>;
      categories: Record<string, number>;
      levels: Record<string, number>;
    };
  };
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#4ECDC4',
  intermediate: '#FFA500',
  advanced: '#FF6B6B',
  expert: '#9B59B6',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
  expert: '전문가',
};

const DOMAIN_LABELS: Record<string, string> = {
  ai_ml: 'AI/ML',
  robotics: '로보틱스',
  perception: '인식',
  control: '제어',
  navigation: '납법',
  manipulation: '조작',
  manufacturing: '제조',
  mechatronics: '메카트로닉스',
  safety: '안전',
  integration: '통합',
};

const CATEGORY_ICONS: Record<string, string> = {
  programming: '💻',
  robotics: '🤖',
  ai_ml: '🧠',
  computer_vision: '👁️',
  ai_framework: '📊',
  design: '🎨',
  control: '🎮',
  navigation: '🧭',
  safety: '🛡️',
  perception: '🔍',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [facets, setFacets] = useState<SearchResponse['meta']['facets'] | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    domains: [],
    categories: [],
    levels: [],
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (searchQuery: string, searchFilters: SearchFilters, searchOffset = 0) => {
    if (!searchQuery.trim() && searchFilters.domains.length === 0 && searchFilters.categories.length === 0 && searchFilters.levels.length === 0) {
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
        setResults(prev => [...prev, ...data.data]);
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
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
    setOffset(0);
  };

  const clearFilters = () => {
    setFilters({ domains: [], categories: [], levels: [] });
    setOffset(0);
  };

  const loadMore = () => {
    const newOffset = offset + 20;
    setOffset(newOffset);
    search(query, filters, newOffset);
  };

  const activeFiltersCount = filters.domains.length + filters.categories.length + filters.levels.length;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
          🔍 고급 스킬 검색
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          ESCO 스킬 데이터베이스에서 원하는 스킬을 빠르게 찾아보세요
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="스킬 이름, 카테고리, 도메인으로 검색..."
            style={{
              width: '100%',
              padding: '1.25rem 1.5rem',
              paddingLeft: '3.5rem',
              fontSize: '1.1rem',
              borderRadius: '12px',
              border: '2px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
          />
          <span style={{
            position: 'absolute',
            left: '1.25rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.25rem',
          }}>
            🔍
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
                fontSize: '1.25rem',
                color: 'var(--text-muted)',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
        <div>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>필터</h3>
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
                  초기화 ({activeFiltersCount})
                </button>
              )}
            </div>

            {facets && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                    도메인
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
                        background: filters.domains.includes(domain) ? 'var(--color-primary)22' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={filters.domains.includes(domain)}
                          onChange={() => toggleFilter('domains', domain)}
                        />
                        <span>{DOMAIN_LABELS[domain] || domain}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {count}
                      </span>
                    </label>
                  ))}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                    난이도
                  </h4>
                  {Object.entries(facets.levels).map(([level, count]) => (
                    <label
                      key={level}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        background: filters.levels.includes(level) ? 'var(--color-primary)22' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={filters.levels.includes(level)}
                          onChange={() => toggleFilter('levels', level)}
                        />
                        <span style={{ 
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: LEVEL_COLORS[level],
                          marginRight: '0.25rem',
                        }} />
                        <span>{LEVEL_LABELS[level] || level}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {count}
                      </span>
                    </label>
                  ))}
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                    카테고리
                  </h4>
                  {Object.entries(facets.categories).map(([category, count]) => (
                    <label
                      key={category}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        background: filters.categories.includes(category) ? 'var(--color-primary)22' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={() => toggleFilter('categories', category)}
                        />
                        <span>{CATEGORY_ICONS[category] || '📁'} {category}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {count}
                      </span>
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
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ color: 'var(--text-secondary)' }}>검색 중...</p>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: 'var(--text-secondary)' }}>검색 결과가 없습니다</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                총 {total}개 결과
              </div>

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                        {CATEGORY_ICONS[skill.category] || '📁'} {skill.name}
                      </h3>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: LEVEL_COLORS[skill.level] + '22',
                          color: LEVEL_COLORS[skill.level],
                        }}
                      >
                        {LEVEL_LABELS[skill.level] || skill.level}
                      </span>
                    </div>

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
                    {loading ? '로딩 중...' : '더 보기'}
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
