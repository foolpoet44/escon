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
    const [userSelectedEnablers, setUserSelectedEnablers] = useState<string[]>([]);

    useEffect(() => {
        if (orgData) {
            setUserSelectedEnablers(orgData.enablers.map(e => e.id));
        }
    }, [orgData]);

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

                {/* 1. Mission Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>🏆 조직 미션</h2>
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                            로봇솔루션 Task는 스마트 팩토리 현장에 즉시 적용 가능한 로봇기술 스택을 제공하고, 셀/라인 단위의 재구성 가능한 자동화를 구현하는 것을 핵심 미션으로 한다.
                        </p>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            이를 통해 공정 전환 시간을 줄이고, 안전·품질·가동률을 동시에 개선하는 Factory Robotics 혁신을 지원한다.
                        </p>
                    </div>
                </section>

                {/* 2. Challenges Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>🚩 주요 기술 과제</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>공정별 로봇 적용 확장</h3>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <li style={{ marginBottom: '0.5rem' }}>공정/제품/설비 특성에 따라 로봇 적용 방식이 상이</li>
                                <li>셀 단위 로봇 엔지니어링을 빠르게 구성·전환해야 함</li>
                            </ul>
                        </div>
                        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>통합/유지보수 비용 최적화</h3>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <li style={{ marginBottom: '0.5rem' }}>로봇 티칭/교정, 안전 규격, 연동 테스트 부담</li>
                                <li>PLC/SCADA/비전/로봇의 통합 난이도와 비용을 낮춰야 함</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 3. Enablers (Core Tech) Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            🎯 Enablers (로봇기술 기반)
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            공정에 바로 적용 가능한 로봇기술 스택 기반의 문제 해결
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

                {/* Skills Section with Filter */}
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
                            {/* Enabler Filter Component would go here, providing manual implementation since we need to import it first */}
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
                                    if (userSelectedEnablers.length === 0) return false; // If no enablers are selected, show no skills
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
                                                {skill.match_type?.toUpperCase() || 'N/A'}
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

                {/* Statistics Cards */}
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

                {/* 4. Value Proposition Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>💎 제공 가치 (Value Proposition)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#FF6B6B' }}>모듈형 로봇기술 확산</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Plug & Play 구조로 즉시 적용<br />Low Code로 셋업 및 재구성 부담 최소화
                            </p>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#FFA500' }}>현장 엔지니어 중심 운영</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                One-click Calibration<br />직관적 UI 및 표준화된 오류 대응
                            </p>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#4ECDC4' }}>운영 가시성 및 통합 제어</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                생산라인 이벤트 모니터링 및 통합 제어<br />로그 기반 분석 및 공정 최적화
                            </p>
                        </div>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#45B7D1' }}>로봇지능 기반 자동화</h3>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                공정 변화 감지 및 경로 최적화<br />품질 개선과 불량 감소
                            </p>
                        </div>
                    </div>
                </section>

                {/* 5. Role & Expectations Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>🚀 역할 및 기대효과</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>조직의 역할</h3>
                            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-primary)' }}>
                                <li>로봇 셀/라인 중심의 표준 기술 스택 정의</li>
                                <li>공정별 로봇 적용 패턴(Workcell) 템플릿 설계</li>
                                <li>비전·제어·로봇 통합 기준과 안전 규격 내재화</li>
                                <li>현장 엔지니어 중심 운영 도구/가이드 제공</li>
                                <li>빠른 공정 전환이 가능한 로봇 자동화 기반 마련</li>
                            </ul>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '2px solid #57B068', paddingBottom: '0.5rem', display: 'inline-block' }}>기대 효과</h3>
                            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-primary)' }}>
                                <li>로봇 셀/라인 전환 소요시간 단축</li>
                                <li>공정 생산성 및 유연성 향상</li>
                                <li>통합/유지보수 비용 감소</li>
                                <li>안전/품질 지표 개선</li>
                                <li>데이터 기반 공정 최적화 달성</li>
                            </ul>
                        </div>
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

                {/* 6. Conclusion Section */}
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%)', borderRadius: '16px', marginTop: '4rem' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                        &quot;현장에 바로 쓰이는 로봇기술,<br />공정 변화에 빠르게 대응하는 Factory Robotics&quot;
                    </h3>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                        로봇솔루션 Task가 만들어가는 미래입니다.
                    </p>
                </div>
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
