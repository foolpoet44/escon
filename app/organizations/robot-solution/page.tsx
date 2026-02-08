'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EnablerCard from '@/app/components/EnablerCard';
import OrgExportButton from '@/app/components/OrgExportButton';
import { loadRobotSolutionData, getEnrichedSkills, calculateOrgStatistics } from '@/app/lib/org-skills-data';
import type { Organization, EnrichedSkill } from '@/app/lib/types';

export default function RobotSolutionPage() {
    const [orgData, setOrgData] = useState<Organization | null>(null);
    const [enrichedSkills, setEnrichedSkills] = useState<EnrichedSkill[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const data = await loadRobotSolutionData();
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
    }, []);

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

                {/* Statistics Cards */}
                {stats && (
                    <section style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <StatCard icon="📊" label="총 스킬 수" value={stats.totalSkills} color="#4ECDC4" />
                            <StatCard icon="🎯" label="Enabler 수" value={stats.totalEnablers} color="#FF6B6B" />
                            <StatCard icon="⭐" label="Expert 필요 스킬" value={stats.byProficiency.find((p: any) => p.level === 'Expert')?.count || 0} color="#FFA500" />
                            <StatCard icon="✅" label="ESCO 매핑률" value={`${Math.round((stats.byMatchType.find((m: any) => m.type === 'exact')?.count || 0) / stats.totalSkills * 100)}%`} color="#6BCF7F" />
                        </div>
                    </section>
                )}

                {/* Enablers Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            🎯 Enablers
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            조직의 핵심 전략 및 역량 영역
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

                {/* Info Section */}
                <section style={{ padding: '2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                        💡 다음 단계
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <InfoCard
                            icon="📋"
                            title="Enabler 상세 보기"
                            description="각 Enabler 카드를 클릭하여 필요한 스킬 목록을 확인하세요"
                        />
                        <InfoCard
                            icon="📥"
                            title="데이터 내보내기"
                            description="CSV/JSON 형식으로 스킬 데이터를 다운로드하여 분석하세요"
                        />
                        <InfoCard
                            icon="🔗"
                            title="ESCO 연동"
                            description="ESCO 국제 표준과 연결된 스킬 정보를 활용하세요"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

// Helper Components
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
    return (
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '2px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color, marginBottom: '0.5rem' }}>{value}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        </div>
    );
}

function InfoCard({ icon, title, description }: { icon: string; title: string; description: string }) {
    return (
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{description}</p>
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
