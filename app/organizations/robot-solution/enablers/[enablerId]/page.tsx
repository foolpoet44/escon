'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OrgSkillCard from '@/app/components/OrgSkillCard';
import OrgExportButton from '@/app/components/OrgExportButton';
import { loadRobotSolutionData, getEnrichedSkills, getSkillsByEnabler } from '@/app/lib/org-skills-data';
import type { Organization, EnrichedSkill, Enabler } from '@/app/lib/types';

export default function EnablerDetailPage() {
    const params = useParams();
    const enablerId = params.enablerId as string;

    const [orgData, setOrgData] = useState<Organization | null>(null);
    const [enabler, setEnabler] = useState<Enabler | null>(null);
    const [skills, setSkills] = useState<EnrichedSkill[]>([]);
    const [filteredSkills, setFilteredSkills] = useState<EnrichedSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [importanceFilter, setImportanceFilter] = useState<number[]>([1, 2, 3, 4, 5]);
    const [proficiencyFilter, setProficiencyFilter] = useState<string[]>(['Beginner', 'Intermediate', 'Advanced', 'Expert']);
    const [matchTypeFilter, setMatchTypeFilter] = useState<string[]>(['exact', 'approximate', 'custom']);
    const [sortBy, setSortBy] = useState<'priority' | 'importance' | 'name'>('priority');

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const data = await loadRobotSolutionData();
                setOrgData(data);

                // Find the specific enabler
                const foundEnabler = data.enablers.find(e => e.id === enablerId);
                if (!foundEnabler) {
                    setError('Enabler를 찾을 수 없습니다.');
                    setLoading(false);
                    return;
                }
                setEnabler(foundEnabler);

                // Get enriched skills for this enabler
                const allSkills = await getEnrichedSkills(data);
                const enablerSkills = getSkillsByEnabler(allSkills, enablerId);
                setSkills(enablerSkills);
                setFilteredSkills(enablerSkills);

                setLoading(false);
            } catch (err) {
                console.error('Failed to load enabler data:', err);
                setError('데이터를 불러오는데 실패했습니다.');
                setLoading(false);
            }
        }

        loadData();
    }, [enablerId]);

    // Apply filters and sorting
    useEffect(() => {
        let filtered = skills.filter(skill => {
            const importance = skill.org_context?.importance || 0;
            const proficiency = skill.org_context?.target_proficiency || '';
            const matchType = skill.match_type || '';

            return (
                importanceFilter.includes(importance) &&
                proficiencyFilter.includes(proficiency) &&
                matchTypeFilter.includes(matchType)
            );
        });

        // Sort
        filtered = filtered.sort((a, b) => {
            if (sortBy === 'priority') {
                return (a.org_context?.priority_rank || 999) - (b.org_context?.priority_rank || 999);
            } else if (sortBy === 'importance') {
                return (b.org_context?.importance || 0) - (a.org_context?.importance || 0);
            } else {
                return (a.org_context?.korean_label || a.label).localeCompare(b.org_context?.korean_label || b.label);
            }
        });

        setFilteredSkills(filtered);
    }, [skills, importanceFilter, proficiencyFilter, matchTypeFilter, sortBy]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>데이터 로딩 중...</p>
                </div>
            </div>
        );
    }

    if (error || !enabler || !orgData) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{error || 'Enabler를 찾을 수 없습니다.'}</p>
                    <Link href="/organizations/robot-solution" style={{ color: 'var(--accent-primary)', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>
                        조직 페이지로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    const stats = {
        total: skills.length,
        expert: skills.filter(s => s.org_context?.target_proficiency === 'Expert').length,
        highImportance: skills.filter(s => (s.org_context?.importance || 0) >= 4).length,
        escoMapped: skills.filter(s => s.match_type === 'exact').length,
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Breadcrumb */}
                <nav style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <Link href="/organizations" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>조직</Link>
                    {' / '}
                    <Link href="/organizations/robot-solution" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{orgData.organization.name}</Link>
                    {' / '}
                    <span>{enabler.name}</span>
                </nav>

                {/* Header */}
                <header style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ flex: '1 1 auto' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{
                                    background: getPriorityColor(enabler.priority),
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                }}>
                                    P{enabler.priority}
                                </span>
                            </div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                                {enabler.name}
                            </h1>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                {enabler.name_en}
                            </p>
                            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
                                {enabler.description}
                            </p>
                        </div>

                        {/* Export Button */}
                        <div>
                            <OrgExportButton
                                data={filteredSkills}
                                dataType="skills"
                                label="스킬 내보내기"
                                filename={`${enablerId}_skills.csv`}
                                variant="primary"
                            />
                        </div>
                    </div>
                </header>

                {/* Statistics */}
                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        <StatCard icon="📊" label="총 스킬" value={stats.total} color="#4ECDC4" />
                        <StatCard icon="⭐" label="Expert 필요" value={stats.expert} color="#FF6B6B" />
                        <StatCard icon="🎯" label="중요도 4-5" value={stats.highImportance} color="#FFA500" />
                        <StatCard icon="✅" label="ESCO 매핑" value={stats.escoMapped} color="#6BCF7F" />
                    </div>
                </section>

                {/* Filters */}
                <section style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>🔍 필터 및 정렬</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {/* Importance Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                중요도
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {[5, 4, 3, 2, 1].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => {
                                            if (importanceFilter.includes(level)) {
                                                setImportanceFilter(importanceFilter.filter(l => l !== level));
                                            } else {
                                                setImportanceFilter([...importanceFilter, level]);
                                            }
                                        }}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            border: '2px solid',
                                            borderColor: importanceFilter.includes(level) ? getImportanceColor(level) : 'var(--border-color)',
                                            background: importanceFilter.includes(level) ? getImportanceColor(level) : 'transparent',
                                            color: importanceFilter.includes(level) ? 'white' : 'var(--text-primary)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {'⭐'.repeat(level)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Proficiency Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                목표 숙련도
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['Expert', 'Advanced', 'Intermediate', 'Beginner'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => {
                                            if (proficiencyFilter.includes(level)) {
                                                setProficiencyFilter(proficiencyFilter.filter(l => l !== level));
                                            } else {
                                                setProficiencyFilter([...proficiencyFilter, level]);
                                            }
                                        }}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            border: '2px solid',
                                            borderColor: proficiencyFilter.includes(level) ? '#4ECDC4' : 'var(--border-color)',
                                            background: proficiencyFilter.includes(level) ? '#4ECDC4' : 'transparent',
                                            color: proficiencyFilter.includes(level) ? 'white' : 'var(--text-primary)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Match Type Filter */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                매칭 타입
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {[
                                    { value: 'exact', label: '✅ Exact', color: '#6BCF7F' },
                                    { value: 'approximate', label: '⚠️ Approximate', color: '#FFA500' },
                                    { value: 'custom', label: '🔧 Custom', color: '#FF6B6B' },
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        onClick={() => {
                                            if (matchTypeFilter.includes(type.value)) {
                                                setMatchTypeFilter(matchTypeFilter.filter(t => t !== type.value));
                                            } else {
                                                setMatchTypeFilter([...matchTypeFilter, type.value]);
                                            }
                                        }}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            border: '2px solid',
                                            borderColor: matchTypeFilter.includes(type.value) ? type.color : 'var(--border-color)',
                                            background: matchTypeFilter.includes(type.value) ? type.color : 'transparent',
                                            color: matchTypeFilter.includes(type.value) ? 'white' : 'var(--text-primary)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                정렬 기준
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    border: '2px solid var(--border-color)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="priority">우선순위</option>
                                <option value="importance">중요도</option>
                                <option value="name">이름</option>
                            </select>
                        </div>
                    </div>

                    {/* Reset Filters */}
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            {filteredSkills.length}개 스킬 표시 중 (전체 {skills.length}개)
                        </p>
                        <button
                            onClick={() => {
                                setImportanceFilter([1, 2, 3, 4, 5]);
                                setProficiencyFilter(['Beginner', 'Intermediate', 'Advanced', 'Expert']);
                                setMatchTypeFilter(['exact', 'approximate', 'custom']);
                                setSortBy('priority');
                            }}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: '2px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            🔄 필터 초기화
                        </button>
                    </div>
                </section>

                {/* Skills Grid */}
                <section>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        📚 스킬 목록
                    </h3>

                    {filteredSkills.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                            {filteredSkills.map((skill, idx) => (
                                <OrgSkillCard
                                    key={idx}
                                    skill={skill}
                                    showOrgContext={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                필터 조건에 맞는 스킬이 없습니다.
                            </p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                필터를 조정하거나 초기화해보세요.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

// Helper Components
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
    return (
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '2px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color, marginBottom: '0.5rem' }}>{value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        </div>
    );
}

// Helper Functions
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

function getImportanceColor(importance: number): string {
    const colors: Record<number, string> = {
        5: '#FF6B6B',
        4: '#FFA500',
        3: '#FFD93D',
        2: '#6BCF7F',
        1: '#95E1D3',
    };
    return colors[importance] || '#4ECDC4';
}
