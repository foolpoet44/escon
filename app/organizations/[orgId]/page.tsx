'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import EnablerCard from '@/app/components/EnablerCard';
import OrgExportButton from '@/app/components/OrgExportButton';
import { loadOrganizationData, getEnrichedSkills, calculateOrgStatistics } from '@/app/lib/org-skills-data';
import type { Organization, EnrichedSkill } from '@/app/lib/types';

export default function OrganizationDetailPage() {
    const params = useParams();
    const orgId = params.orgId as string;

    const [orgData, setOrgData] = useState<Organization | null>(null);
    const [enrichedSkills, setEnrichedSkills] = useState<EnrichedSkill[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userSelectedEnablers, setUserSelectedEnablers] = useState<string[]>([]);

    useEffect(() => {
        if (orgData) {
            setUserSelectedEnablers(orgData.enablers.map(e => e.id));
        }
    }, [orgData]);

    useEffect(() => {
        async function loadData() {
            if (!orgId) return;
            try {
                setLoading(true);
                const data = await loadOrganizationData(orgId);
                setOrgData(data);

                const skills = await getEnrichedSkills(data);
                setEnrichedSkills(skills);

                const statistics = calculateOrgStatistics(data);
                setStats(statistics);

                setLoading(false);
            } catch (err) {
                console.error('Failed to load organization data:', err);
                setError('데이터를 불러오는데 실패했습니다.');
                setLoading(false);
            }
        }

        loadData();
    }, [orgId]);

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

    if (error || !orgData) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{error || '데이터를 찾을 수 없습니다.'}</p>
                    <Link href="/organizations" style={{ color: 'var(--accent-primary)', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>
                        조직 목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    const enablersWithStats = orgData.enablers.map(enabler => ({
        id: enabler.id,
        name: enabler.name,
        name_en: enabler.name_en,
        description: enabler.description,
        priority: enabler.priority,
        skillCount: enabler.skills.length,
        expertSkillCount: enabler.skills.filter(s => s.target_proficiency === 'Expert').length,
        color: getPriorityColor(enabler.priority),
    }));

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{ marginBottom: '3rem' }}>
                    <Link href="/organizations" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        ← 조직 목록으로
                    </Link>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem' }}>
                        <div style={{ flex: '1 1 auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>
                                    🤖 {orgData.organization.name}
                                </h1>
                            </div>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {orgData.organization.name_en}
                            </p>
                            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
                                {orgData.organization.description}
                            </p>
                        </div>

                        {/* Export Buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <OrgExportButton
                                data={enrichedSkills}
                                dataType="skills"
                                label="전체 스킬 내보내기"
                                filename={`${orgData.organization.id}_skills.csv`}
                                variant="primary"
                            />
                            <OrgExportButton
                                data={orgData.enablers}
                                dataType="enablers"
                                filename={`${orgData.organization.id}_enablers.csv`}
                                variant="secondary"
                            />
                            {stats && (
                                <OrgExportButton
                                    data={stats}
                                    dataType="stats"
                                    label="통계 내보내기"
                                    filename={`${orgData.organization.id}_stats.csv`}
                                    variant="secondary"
                                />
                            )}
                        </div>
                    </div>
                </header>

                {/* 1. Mission Section */}
                {orgData.organization.mission_detail && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>🏆 조직 미션</h2>
                        <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '0' }}>
                                {orgData.organization.mission_detail}
                            </p>
                        </div>
                    </section>
                )}

                {/* 2. Challenges Section */}
                {orgData.organization.challenges && orgData.organization.challenges.length > 0 && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>🚩 주요 도전 과제</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {orgData.organization.challenges.map((challenge, index) => (
                                <div key={index} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>{challenge.title}</h3>
                                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        {challenge.items.map((item, i) => (
                                            <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Enablers Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            🎯 Enablers (핵심 기반)
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            모듈화, 표준화, 기술 기반 자동화 문제 해결
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {enablersWithStats.map(enabler => (
                            <EnablerCard
                                key={enabler.id}
                                enabler={enabler}
                                organizationId={orgData.organization.id}
                            />
                        ))}
                    </div>
                </section>

                {/* 4. Skills Section with Filter */}
                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            🛠️ 보유 스킬 (Skills)
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Enabler별 핵심 역량 및 스킬 상세 정보
                        </p>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Enabler 필터</h3>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setUserSelectedEnablers(enablersWithStats.map(e => e.id))}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: '1px solid var(--border-color)',
                                        background: userSelectedEnablers.length === enablersWithStats.length ? 'var(--text-primary)' : 'transparent',
                                        color: userSelectedEnablers.length === enablersWithStats.length ? 'var(--bg-primary)' : 'var(--text-primary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    전체 선택
                                </button>
                                {enablersWithStats.map(enabler => (
                                    <button
                                        key={enabler.id}
                                        onClick={() => {
                                            if (userSelectedEnablers.includes(enabler.id)) {
                                                setUserSelectedEnablers(userSelectedEnablers.filter(id => id !== enabler.id));
                                            } else {
                                                setUserSelectedEnablers([...userSelectedEnablers, enabler.id]);
                                            }
                                        }}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            border: `1px solid ${enabler.color}`,
                                            background: userSelectedEnablers.includes(enabler.id) ? `${enabler.color}22` : 'transparent',
                                            color: userSelectedEnablers.includes(enabler.id) ? enabler.color : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: enabler.color }}></span>
                                        {enabler.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                            {enrichedSkills
                                .filter(skill => {
                                    if (userSelectedEnablers.length === 0) return false;
                                    const skillEnablerName = skill.org_context?.enabler;
                                    const matchedEnabler = enablersWithStats.find(e => e.name === skillEnablerName);
                                    return matchedEnabler && userSelectedEnablers.includes(matchedEnabler.id);
                                })
                                .map((skill, idx) => (
                                    <div key={idx} style={{
                                        background: 'var(--bg-secondary)',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{skill.org_context?.korean_label || skill.label}</h4>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: skill.match_type === 'exact' ? '#6BCF7F22' : '#FFA50022',
                                                color: skill.match_type === 'exact' ? '#6BCF7F' : '#FFA500'
                                            }}>
                                                {skill.match_type?.toUpperCase()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{skill.label}</p>
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>중요도: {'⭐'.repeat(skill.org_context?.importance || 0)}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>수준: {skill.org_context?.target_proficiency}</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </section>

                {/* 5. Statistics Cards */}
                {stats && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>📊 데이터 요약</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <StatCard icon="📊" label="총 스킬 수" value={stats.totalSkills} color="#4ECDC4" />
                            <StatCard icon="🎯" label="Enabler 수" value={stats.totalEnablers} color="#FF6B6B" />
                            <StatCard icon="⭐" label="Expert 필요 스킬" value={stats.byProficiency.find((p: any) => p.level === 'Expert')?.count || 0} color="#FFA500" />
                            <StatCard icon="✅" label="ESCO 매핑률" value={`${Math.round((stats.byMatchType.find((m: any) => m.type === 'exact')?.count || 0) / stats.totalSkills * 100)}%`} color="#6BCF7F" />
                        </div>
                    </section>
                )}

                {/* 6. Value Proposition Section */}
                {orgData.organization.value_propositions && orgData.organization.value_propositions.length > 0 && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>💎 제공 가치 (Value Proposition)</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {orgData.organization.value_propositions.map((prop, idx) => (
                                <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: ['#FF6B6B', '#FFA500', '#4ECDC4', '#45B7D1'][idx % 4] }}>{prop.title}</h3>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                        {prop.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 7. Roles & Expectations */}
                {(orgData.organization.roles || orgData.organization.expectations) && (
                    <section style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {orgData.organization.roles && (
                                <InfoCard
                                    title="🎯 Role (우리가 하는 일)"
                                    items={orgData.organization.roles}
                                    color="#FF6B6B"
                                />
                            )}
                            {orgData.organization.expectations && (
                                <InfoCard
                                    title="🚀 Expectations (기대 효과)"
                                    items={orgData.organization.expectations}
                                    color="#4ECDC4"
                                />
                            )}
                        </div>
                    </section>
                )}

                {/* 8. Conclusion */}
                {orgData.organization.conclusion && (
                    <section style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: '20px', margin: '2rem 0' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                            {orgData.organization.conclusion.slogan}
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                            {orgData.organization.conclusion.description}
                        </p>
                    </section>
                )}
            </div>
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

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
    return (
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: color }}>{value}</p>
            </div>
        </div>
    );
}

function InfoCard({ title, items, color = 'var(--text-primary)' }: { title: string; items: string[]; color?: string }) {
    return (
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${color}`, border: '1px solid var(--border-color)', borderLeftWidth: '4px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: color }}>{title}</h3>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
