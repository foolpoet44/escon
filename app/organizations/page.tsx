'use client';

import Link from 'next/link';

export default function OrganizationsPage() {
    const organizations = [
        {
            id: 'robot-solution',
            name: '로봇솔루션 Task',
            name_en: 'Robot Solution Task Force',
            description: '스마트 팩토리 현장에 즉시 적용 가능한 로봇기술 스택 기반 자동화 솔루션 제공',
            skillCount: 29,
            enablerCount: 3,
            icon: '🤖',
            color: '#FF6B6B',
        },
        {
            id: 'smart-factory',
            name: '스마트팩토리 구축 Task',
            name_en: 'Smart Factory Implementation Task Force',
            description: '제조 현장의 디지털 전환을 위한 IoT/PLC/SCADA 통합 및 AI 예측 보전 시스템 구축',
            skillCount: 17,
            enablerCount: 3,
            icon: '🏭',
            color: '#F7DC6F',
        },
        {
            id: 'vision-inspection',
            name: '비전검사 자동화 Task',
            name_en: 'Vision Inspection Automation Task Force',
            description: 'AI 비전 기반 제품 외관 검사 자동화 — 딥러닝 검출 및 현장 MLOps 파이프라인',
            skillCount: 16,
            enablerCount: 3,
            icon: '👁️',
            color: '#4ECDC4',
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        🏢 Organizations
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        조직별 스킬 매칭 시스템 - ESCO 기반 역량 관리
                    </p>
                </header>

                {/* Organization Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {organizations.map((org) => (
                        <Link
                            key={org.id}
                            href={`/organizations/${org.id}`}
                            style={{
                                background: 'var(--bg-card)',
                                border: '2px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '2rem',
                                textDecoration: 'none',
                                color: 'var(--text-primary)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.borderColor = org.color;
                                e.currentTarget.style.boxShadow = `0 12px 40px ${org.color}22`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Icon */}
                            <div style={{ fontSize: '4rem', lineHeight: 1 }}>{org.icon}</div>

                            {/* Title */}
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                    {org.name}
                                </h2>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                                    {org.name_en}
                                </p>
                            </div>

                            {/* Description */}
                            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, flexGrow: 1 }}>
                                {org.description}
                            </p>

                            {/* Stats */}
                            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: org.color, lineHeight: 1 }}>
                                        {org.enablerCount}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                                        Enablers
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: org.color, lineHeight: 1 }}>
                                        {org.skillCount}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                                        Skills
                                    </div>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', fontSize: '1.5rem', color: org.color, opacity: 0, transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.opacity = '1';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                →
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Info Section */}
                <section style={{ marginTop: '4rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                        💡 조직 스킬 매칭 시스템이란?
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>전략 기반 스킬 관리</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                조직의 Enabler(핵심 전략)에 맞춘 필수 스킬 정의
                            </p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗</div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>ESCO 국제 표준</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                유럽 공식 스킬 분류 체계와 연결하여 글로벌 호환성 확보
                            </p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>데이터 기반 의사결정</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                역량 진단, 채용 계획, 교육 로드맵 수립에 활용
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
