'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DOMAINS, DOMAIN_COLORS, SKILL_TYPE_LABELS } from '../lib/constants';
import { DomainKey, SkillType } from '../lib/types';
import { exportToCSV, exportToJSON, getDateString } from '../lib/export';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlatSkill {
  id: string;
  uri: string;
  label: string;
  type: SkillType;
  description: string;
  domain: DomainKey[];
}

type ViewMode = 'card' | 'list' | 'table';
type SortBy = 'domain' | 'alpha' | 'alpha-desc' | 'type-k' | 'type-c';

interface ExplorerFilters {
  query: string;
  domains: DomainKey[];
  types: SkillType[];
  smartFactoryFocus: boolean;
}

interface Facets {
  domains: Record<string, number>;
  types: Record<string, number>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOMAIN_LABELS = DOMAINS.reduce<Record<DomainKey, string>>((acc, d) => {
  acc[d.key] = d.name;
  return acc;
}, {} as Record<DomainKey, string>);

const DOMAIN_ICONS = DOMAINS.reduce<Record<DomainKey, string>>((acc, d) => {
  acc[d.key] = d.icon;
  return acc;
}, {} as Record<DomainKey, string>);

const PAGE_SIZE = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByDomain(skills: FlatSkill[]): { domain: DomainKey; skills: FlatSkill[] }[] {
  const map = new Map<DomainKey, FlatSkill[]>();
  DOMAINS.forEach((d) => map.set(d.key, []));
  skills.forEach((s) => {
    s.domain.forEach((dk) => {
      if (map.has(dk)) map.get(dk)!.push(s);
    });
  });
  return Array.from(map.entries())
    .filter(([, list]) => list.length > 0)
    .map(([domain, list]) => ({ domain, skills: list }));
}

function sortSkills(skills: FlatSkill[], sortBy: SortBy): FlatSkill[] {
  const copy = [...skills];
  if (sortBy === 'alpha') return copy.sort((a, b) => a.label.localeCompare(b.label));
  if (sortBy === 'alpha-desc') return copy.sort((a, b) => b.label.localeCompare(a.label));
  if (sortBy === 'type-k') return copy.sort((a, b) => {
    if (a.type === b.type) return a.label.localeCompare(b.label);
    return a.type === 'knowledge' ? -1 : 1;
  });
  if (sortBy === 'type-c') return copy.sort((a, b) => {
    if (a.type === b.type) return a.label.localeCompare(b.label);
    return a.type === 'skill/competence' ? -1 : 1;
  });
  return copy;
}

function truncate(text: string, max = 120): string {
  return text.length <= max ? text : text.slice(0, max).trim() + '\u2026';
}

// ─── TypeBadge ────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: SkillType }) {
  const isKnowledge = type === 'knowledge';
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      background: isKnowledge ? 'rgba(69,183,209,0.15)' : 'rgba(152,216,200,0.15)',
      color: isKnowledge ? '#45B7D1' : '#98D8C8',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {isKnowledge ? 'Knowledge' : 'Competence'}
    </span>
  );
}

// ─── DomainTag ────────────────────────────────────────────────────────────────

function DomainTag({ domainKey }: { domainKey: DomainKey }) {
  const color = DOMAIN_COLORS[domainKey] || '#666';
  return (
    <span style={{
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '0.7rem',
      background: `${color}22`,
      color: color,
      fontWeight: 600,
    }}>
      {DOMAIN_ICONS[domainKey]} {DOMAIN_LABELS[domainKey]}
    </span>
  );
}

// ─── StatsBadge ───────────────────────────────────────────────────────────────

function StatsBadge({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: accent || 'var(--color-primary)' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

// ─── SkillCard (Card View) ────────────────────────────────────────────────────

function SkillCard({ skill, selected, onClick }: { skill: FlatSkill; selected: boolean; onClick: () => void }) {
  const domainKey = skill.domain[0];
  const color = DOMAIN_COLORS[domainKey] || '#4ECDC4';
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        borderRadius: '10px',
        border: `1px solid ${selected ? color : 'var(--border-color)'}`,
        borderLeft: `4px solid ${color}`,
        padding: '1rem 1.125rem',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: selected ? `0 0 0 2px ${color}44` : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = `${color}88`;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{skill.label}</span>
        <TypeBadge type={skill.type} />
      </div>
      {skill.description && (
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {truncate(skill.description)}
        </p>
      )}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '0.25rem' }}>
        {skill.domain.map((dk) => <DomainTag key={dk} domainKey={dk} />)}
      </div>
    </div>
  );
}

// ─── SkillRow (List View) ─────────────────────────────────────────────────────

function SkillRow({ skill, selected, onClick }: { skill: FlatSkill; selected: boolean; onClick: () => void }) {
  const domainKey = skill.domain[0];
  const color = DOMAIN_COLORS[domainKey] || '#4ECDC4';
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 1rem',
        background: selected ? `${color}11` : 'var(--bg-card)',
        borderLeft: `3px solid ${selected ? color : 'transparent'}`,
        borderBottom: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'var(--bg-card)'; }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skill.label}</div>
      </div>
      <TypeBadge type={skill.type} />
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {skill.domain.slice(0, 2).map((dk) => <DomainTag key={dk} domainKey={dk} />)}
      </div>
    </div>
  );
}

// ─── SkillTable (Table View) ──────────────────────────────────────────────────

function SkillTable({ skills, selectedSkill, onSelect }: { skills: FlatSkill[]; selectedSkill: FlatSkill | null; onSelect: (s: FlatSkill) => void }) {
  const [sortCol, setSortCol] = useState<'label' | 'type' | 'domain'>('label');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = [...skills].sort((a, b) => {
    const av = sortCol === 'label' ? a.label : sortCol === 'type' ? a.type : a.domain[0];
    const bv = sortCol === 'label' ? b.label : sortCol === 'type' ? b.type : b.domain[0];
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const toggle = (col: typeof sortCol) => {
    if (col === sortCol) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const thStyle = {
    padding: '0.75rem 1rem',
    textAlign: 'left' as const,
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    cursor: 'pointer',
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
    borderBottom: '2px solid var(--border-color)',
    background: 'var(--bg-card)',
  };

  return (
    <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            <th style={thStyle} onClick={() => toggle('label')}>스킬명 {sortCol === 'label' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : '\u2195'}</th>
            <th style={thStyle} onClick={() => toggle('type')}>유형 {sortCol === 'type' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : '\u2195'}</th>
            <th style={thStyle} onClick={() => toggle('domain')}>도메인 {sortCol === 'domain' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : '\u2195'}</th>
            <th style={{ ...thStyle, cursor: 'default' }}>설명</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((skill) => {
            const sel = selectedSkill?.id === skill.id;
            const color = DOMAIN_COLORS[skill.domain[0]] || '#4ECDC4';
            return (
              <tr
                key={skill.id}
                onClick={() => onSelect(skill)}
                style={{ background: sel ? `${color}11` : 'transparent', cursor: 'pointer', borderLeft: sel ? `3px solid ${color}` : '3px solid transparent' }}
                onMouseEnter={(e) => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={(e) => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', maxWidth: '240px' }}>{skill.label}</td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}><TypeBadge type={skill.type} /></td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {skill.domain.map((dk) => <DomainTag key={dk} domainKey={dk} />)}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', maxWidth: '400px' }}>{truncate(skill.description, 100)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── SkillDetailPanel ─────────────────────────────────────────────────────────

function SkillDetailPanel({ skill, allSkills, onClose }: { skill: FlatSkill; allSkills: FlatSkill[]; onClose: () => void }) {
  const domainKey = skill.domain[0];
  const color = DOMAIN_COLORS[domainKey] || '#4ECDC4';

  const related = allSkills
    .filter((s) => s.id !== skill.id && s.domain.some((dk) => skill.domain.includes(dk)))
    .slice(0, 5);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      <style>{`@keyframes slideInPanel { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }`}</style>
      <div style={{
        width: '360px',
        flexShrink: 0,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderLeft: `4px solid ${color}`,
        borderRadius: '12px',
        padding: '1.5rem',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 200px)',
        position: 'sticky',
        top: '1rem',
        animation: 'slideInPanel 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <TypeBadge type={skill.type} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1, padding: '0' }}>&#x2715;</button>
        </div>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.3, marginTop: 0 }}>{skill.label}</h2>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {skill.domain.map((dk) => <DomainTag key={dk} domainKey={dk} />)}
        </div>

        {skill.description && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Description</div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{skill.description}</p>
          </div>
        )}

        {skill.uri && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>ESCO URI</div>
            <a
              href={skill.uri}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.78rem', color: color, wordBreak: 'break-all', textDecoration: 'none', borderBottom: `1px dashed ${color}` }}
            >
              {skill.uri}
            </a>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <a href="/network" style={{ display: 'inline-block', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, color: color, background: `${color}15`, borderRadius: '6px', textDecoration: 'none', border: `1px solid ${color}44` }}>
            네트워크에서 보기 &rarr;
          </a>
          <a href="/tree" style={{ display: 'inline-block', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, color: color, background: `${color}15`, borderRadius: '6px', textDecoration: 'none', border: `1px solid ${color}44` }}>
            트리에서 보기 &rarr;
          </a>
        </div>

        {related.length > 0 && (
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>같은 도메인 관련 스킬</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {related.map((r) => (
                <div key={r.id} style={{ padding: '0.45rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {r.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── LoadMoreButton ───────────────────────────────────────────────────────────

function LoadMoreButton({ onClick, remaining }: { onClick: () => void; remaining: number }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <button
        onClick={onClick}
        style={{ padding: '0.75rem 2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)'; }}
      >
        더 보기 ({remaining.toLocaleString()}개 남음)
      </button>
    </div>
  );
}

// ─── ExportDropdown ───────────────────────────────────────────────────────────

function ExportDropdown({ onExport, count }: { onExport: (f: 'csv' | 'json') => void; count: number }) {
  const [open, setOpen] = useState(false);
  const menuItemStyle = {
    display: 'block', width: '100%', padding: '0.6rem 0.9rem',
    background: 'transparent', border: 'none', textAlign: 'left' as const,
    color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600,
  };
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 0.9rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}
      >
        <span>&#x1F4E5;</span> 내보내기 <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 200, minWidth: '180px', overflow: 'hidden' }}>
          <button onClick={() => { onExport('csv'); setOpen(false); }} style={menuItemStyle}>&#x1F4CA; CSV 내보내기</button>
          <button onClick={() => { onExport('json'); setOpen(false); }} style={menuItemStyle}>&#x1F4C4; JSON 내보내기</button>
          <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>{count}개 스킬</div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SkillExplorerPage() {
  const [allSkills, setAllSkills] = useState<FlatSkill[]>([]);
  const [displaySkills, setDisplaySkills] = useState<FlatSkill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<FlatSkill | null>(null);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [sortBy, setSortBy] = useState<SortBy>('domain');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ExplorerFilters>({
    query: '',
    domains: [],
    types: [],
    smartFactoryFocus: false,
  });
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/search');
        if (!res.ok) throw new Error('Failed to load skills');
        const data = await res.json();
        setAllSkills(data.skills || []);
        setFacets(data.facets || null);
      } catch {
        setError('스킬 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Populate displaySkills once allSkills is loaded ───────────────────────
  useEffect(() => {
    if (allSkills.length > 0) setDisplaySkills(allSkills);
  }, [allSkills]);

  // ── Apply filters ─────────────────────────────────────────────────────────
  const applyFilters = useCallback(async (f: ExplorerFilters) => {
    if (!f.query.trim()) {
      let result = [...allSkills];
      if (f.domains.length > 0)
        result = result.filter((s) => s.domain.some((dk) => f.domains.includes(dk)));
      if (f.types.length > 0)
        result = result.filter((s) => f.types.includes(s.type));
      setDisplaySkills(result);
      setPage(1);
    } else {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: f.query,
            filters: { domains: f.domains, types: f.types, smartFactoryFocus: f.smartFactoryFocus },
            limit: 500,
            offset: 0,
          }),
        });
        const data = await res.json();
        setDisplaySkills(data.data || []);
        setPage(1);
      } catch {
        setDisplaySkills(allSkills);
      }
    }
  }, [allSkills]);

  // Debounced filter
  useEffect(() => {
    if (allSkills.length === 0) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => applyFilters(filters), 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [filters, applyFilters, allSkills]);

  // ── Filter helpers ────────────────────────────────────────────────────────
  const toggleDomain = (dk: DomainKey) => setFilters((prev) => ({
    ...prev,
    domains: prev.domains.includes(dk) ? prev.domains.filter((d) => d !== dk) : [...prev.domains, dk],
  }));

  const toggleType = (t: SkillType) => setFilters((prev) => ({
    ...prev,
    types: prev.types.includes(t) ? prev.types.filter((v) => v !== t) : [...prev.types, t],
  }));

  const clearFilters = () => setFilters({ query: '', domains: [], types: [], smartFactoryFocus: false });

  // ── Derived ───────────────────────────────────────────────────────────────
  const sorted = sortBy === 'domain' ? displaySkills : sortSkills(displaySkills, sortBy);
  const paged = sorted.slice(0, page * PAGE_SIZE);

  // 도메인 그룹뷰: per-domain 슬라이싱 기준으로 hasMore/remaining 계산
  const domainGroups = sortBy === 'domain' ? groupByDomain(displaySkills) : [];
  const domainHasMore = sortBy === 'domain' && domainGroups.some(({ skills: ds }) => ds.length > page * PAGE_SIZE);
  const domainRemaining = domainGroups.reduce((acc, { skills: ds }) => acc + Math.max(0, ds.length - page * PAGE_SIZE), 0);
  const hasMore = sortBy === 'domain' ? domainHasMore : paged.length < sorted.length;
  const remaining = sortBy === 'domain' ? domainRemaining : sorted.length - paged.length;

  const knowledgeCount = displaySkills.filter((s) => s.type === 'knowledge').length;
  const competenceCount = displaySkills.filter((s) => s.type === 'skill/competence').length;
  const activeFilterCount =
    filters.domains.length + filters.types.length +
    (filters.smartFactoryFocus ? 1 : 0) + (filters.query ? 1 : 0);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = (format: 'csv' | 'json') => {
    const dateStr = getDateString();
    const domainStr = filters.domains.length > 0 ? `_${filters.domains.join('-')}` : '';
    const filename = `skills${domainStr}_${dateStr}.${format}`;
    const exportable = displaySkills.map(({ uri, label, type, description }) => ({ uri, label, type, description }));
    if (format === 'csv') exportToCSV(exportable as any, filename);
    else exportToJSON(exportable as any, filename);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <style>{`@keyframes se-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 48, height: 48, border: '4px solid rgba(78,205,196,0.15)', borderRadius: '50%', borderLeftColor: '#4ECDC4', animation: 'se-spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>스킬 데이터 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>&#x26A0;&#xFE0F;</div>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          다시 시도
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>스킬 탐색기</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
          Robotics Tech for Smart Factory &mdash; ESCO 기반 {allSkills.length.toLocaleString()}개 스킬 카탈로그
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <StatsBadge label="표시 스킬" value={displaySkills.length.toLocaleString()} />
        <StatsBadge label="전체 스킬" value={allSkills.length.toLocaleString()} accent="var(--text-muted)" />
        <StatsBadge label="Knowledge" value={knowledgeCount.toLocaleString()} accent="#45B7D1" />
        <StatsBadge label="Competence" value={competenceCount.toLocaleString()} accent="#98D8C8" />
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            style={{ padding: '0.5rem 1rem', background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', color: '#FF6B6B', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            필터 초기화 ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Domain Quick-Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {DOMAINS.map((d) => {
          const active = filters.domains.includes(d.key);
          const count = facets?.domains[d.key] ?? d.skillCount;
          return (
            <button
              key={d.key}
              onClick={() => toggleDomain(d.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                border: `1px solid ${active ? d.color : 'var(--border-color)'}`,
                background: active ? `${d.color}22` : 'var(--bg-card)',
                color: active ? d.color : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{d.icon}</span>
              <span>{d.name}</span>
              <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '1rem' }}>&#x1F50D;</span>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            placeholder="스킬명 또는 설명으로 검색..."
            style={{ width: '100%', padding: '0.65rem 2.25rem 0.65rem 2.25rem', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
          />
          {filters.query && (
            <button onClick={() => setFilters((prev) => ({ ...prev, query: '' }))} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>&#x2715;</button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}
        >
          <option value="domain">도메인 그룹</option>
          <option value="alpha">알파벳 A&#8594;Z</option>
          <option value="alpha-desc">알파벳 Z&#8594;A</option>
          <option value="type-k">Knowledge 우선</option>
          <option value="type-c">Competence 우선</option>
        </select>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          {(['card', 'list', 'table'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={mode === 'card' ? '카드 뷰' : mode === 'list' ? '리스트 뷰' : '테이블 뷰'}
              style={{ padding: '0.6rem 0.85rem', background: viewMode === mode ? 'var(--color-primary)' : 'var(--bg-card)', color: viewMode === mode ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'all 0.15s' }}
            >
              {mode === 'card' ? '\u229E' : mode === 'list' ? '\u2630' : '\u229F'}
            </button>
          ))}
        </div>

        {/* Export */}
        <ExportDropdown onExport={handleExport} count={displaySkills.length} />
      </div>

      {/* Main 3-Column Layout */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Filter Sidebar */}
        <div style={{ width: '240px', flexShrink: 0 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)', padding: '1.25rem', position: 'sticky', top: '1rem' }}>

            {/* SF Focus Toggle */}
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Smart Factory</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>관련성 부스팅</div>
                </div>
                <div
                  onClick={() => setFilters((prev) => ({ ...prev, smartFactoryFocus: !prev.smartFactoryFocus }))}
                  style={{ width: '40px', height: '22px', borderRadius: '11px', background: filters.smartFactoryFocus ? 'var(--color-primary)' : 'var(--border-color)', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
                >
                  <div style={{ position: 'absolute', top: '3px', left: filters.smartFactoryFocus ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
              </div>
            </div>

            {/* Domain Filters */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>도메인</div>
              {DOMAINS.map((d) => {
                const active = filters.domains.includes(d.key);
                const count = facets?.domains[d.key] ?? 0;
                return (
                  <label key={d.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', background: active ? `${d.color}15` : 'transparent', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input type="checkbox" checked={active} onChange={() => toggleDomain(d.key)} style={{ accentColor: d.color }} />
                      <span style={{ fontSize: '0.82rem', color: active ? d.color : 'var(--text-secondary)', fontWeight: active ? 700 : 400 }}>{d.icon} {d.name}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count}</span>
                  </label>
                );
              })}
            </div>

            {/* Type Filters */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>스킬 유형</div>
              {(['knowledge', 'skill/competence'] as SkillType[]).map((t) => {
                const active = filters.types.includes(t);
                const count = facets?.types[t] ?? 0;
                const col = t === 'knowledge' ? '#45B7D1' : '#98D8C8';
                return (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', background: active ? `${col}15` : 'transparent', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input type="checkbox" checked={active} onChange={() => toggleType(t)} style={{ accentColor: col }} />
                      <span style={{ fontSize: '0.82rem', color: active ? col : 'var(--text-secondary)', fontWeight: active ? 700 : 400 }}>
                        {SKILL_TYPE_LABELS[t]}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Skills List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {displaySkills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#x1F50E;</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>검색 결과가 없습니다</div>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem' }}>필터를 변경하거나 검색어를 조정해보세요.</p>
              <button onClick={clearFilters} style={{ padding: '0.5rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>필터 초기화</button>
            </div>
          ) : viewMode === 'table' ? (
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{displaySkills.length.toLocaleString()}개 스킬</div>
              <SkillTable skills={paged} selectedSkill={selectedSkill} onSelect={(s) => setSelectedSkill(selectedSkill?.id === s.id ? null : s)} />
              {hasMore && <LoadMoreButton onClick={() => setPage((p) => p + 1)} remaining={remaining} />}
            </>
          ) : sortBy === 'domain' ? (
            /* Domain-grouped view */
            <>
              {domainGroups.map(({ domain, skills: ds }) => {
                const domainInfo = DOMAINS.find((d) => d.key === domain)!;
                const pagedDs = ds.slice(0, page * PAGE_SIZE);
                return (
                  <div key={domain} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${domainInfo.color}44` }}>
                      <span style={{ fontSize: '1.5rem' }}>{domainInfo.icon}</span>
                      <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: domainInfo.color }}>{domainInfo.name}</h2>
                      <span style={{ padding: '2px 8px', background: `${domainInfo.color}22`, color: domainInfo.color, borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700 }}>{ds.length}</span>
                    </div>
                    {viewMode === 'card' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {pagedDs.map((s) => (
                          <SkillCard key={s.id} skill={s} selected={selectedSkill?.id === s.id} onClick={() => setSelectedSkill(selectedSkill?.id === s.id ? null : s)} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        {pagedDs.map((s) => (
                          <SkillRow key={s.id} skill={s} selected={selectedSkill?.id === s.id} onClick={() => setSelectedSkill(selectedSkill?.id === s.id ? null : s)} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {hasMore && <LoadMoreButton onClick={() => setPage((p) => p + 1)} remaining={remaining} />}
            </>
          ) : (
            /* Flat sorted view */
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{displaySkills.length.toLocaleString()}개 스킬</div>
              {viewMode === 'card' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                  {paged.map((s) => (
                    <SkillCard key={s.id} skill={s} selected={selectedSkill?.id === s.id} onClick={() => setSelectedSkill(selectedSkill?.id === s.id ? null : s)} />
                  ))}
                </div>
              ) : (
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  {paged.map((s) => (
                    <SkillRow key={s.id} skill={s} selected={selectedSkill?.id === s.id} onClick={() => setSelectedSkill(selectedSkill?.id === s.id ? null : s)} />
                  ))}
                </div>
              )}
              {hasMore && <LoadMoreButton onClick={() => setPage((p) => p + 1)} remaining={remaining} />}
            </>
          )}
        </div>

        {/* Skill Detail Panel */}
        {selectedSkill && (
          <SkillDetailPanel
            skill={selectedSkill}
            allSkills={allSkills}
            onClose={() => setSelectedSkill(null)}
          />
        )}
      </div>
    </div>
  );
}
