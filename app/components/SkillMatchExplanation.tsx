'use client';

import { useState } from 'react';

interface SimilarityExplanationProps {
    score: number;
    matchedTerms: string[];
    uniqueTerms1: string[];
    uniqueTerms2: string[];
    label1: string;
    label2: string;
}

interface RelationshipExplanationProps {
    strength: number;
    factors: {
        sameEnabler: boolean;
        sameType: boolean;
        similarImportance: boolean;
        sameProficiency: boolean;
    };
    skill1Label: string;
    skill2Label: string;
}

/**
 * 스킬 유사도 점수의 계산 근거를 투명하게 보여주는 컴포넌트
 * 현장 엔지니어가 "이 점수가 어떻게 나왔는지" 직접 확인할 수 있음
 */
export function SimilarityExplanation({
    score,
    matchedTerms,
    uniqueTerms1,
    uniqueTerms2,
    label1,
    label2,
}: SimilarityExplanationProps) {
    const [isOpen, setIsOpen] = useState(false);

    const scorePercent = Math.round(score * 100);
    const scoreColor = scorePercent >= 60 ? '#4ECDC4' : scorePercent >= 30 ? '#FFA500' : '#FF6B6B';

    return (
        <div style={{ marginTop: '4px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#8892b0',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }}
            >
                <span style={{ color: scoreColor, fontWeight: 'bold' }}>
                    {scorePercent}%
                </span>
                <span>{isOpen ? '▼' : '▶'} 계산 근거</span>
            </button>

            {isOpen && (
                <div
                    style={{
                        marginTop: '8px',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        lineHeight: '1.6',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <div style={{ marginBottom: '8px', color: '#ccd6f6' }}>
                        <strong>{label1}</strong> ↔ <strong>{label2}</strong>
                    </div>

                    {matchedTerms.length > 0 && (
                        <div style={{ marginBottom: '6px' }}>
                            <span style={{ color: '#4ECDC4' }}>일치 키워드:</span>{' '}
                            {matchedTerms.map((term, i) => (
                                <span
                                    key={i}
                                    style={{
                                        display: 'inline-block',
                                        background: 'rgba(78, 205, 196, 0.2)',
                                        padding: '1px 6px',
                                        borderRadius: '3px',
                                        margin: '1px 2px',
                                        color: '#4ECDC4',
                                    }}
                                >
                                    {term}
                                </span>
                            ))}
                        </div>
                    )}

                    <div style={{ color: '#8892b0', fontSize: '11px' }}>
                        <div>
                            고유 키워드 ({label1}): {uniqueTerms1.length > 0 ? uniqueTerms1.join(', ') : '없음'}
                        </div>
                        <div>
                            고유 키워드 ({label2}): {uniqueTerms2.length > 0 ? uniqueTerms2.join(', ') : '없음'}
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: '8px',
                            padding: '6px 8px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '4px',
                            color: '#a8b2d1',
                            fontSize: '11px',
                        }}
                    >
                        계산: 일치 키워드 {matchedTerms.length}개 ÷ 전체 고유 키워드{' '}
                        {matchedTerms.length + uniqueTerms1.length + uniqueTerms2.length}개 ={' '}
                        <strong style={{ color: scoreColor }}>{scorePercent}%</strong>
                        <br />
                        <span style={{ fontSize: '10px', opacity: 0.7 }}>
                            (불용어 제거 + 기술용어 정규화 적용)
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * 조직 내 스킬 관계 강도의 계산 근거를 보여주는 컴포넌트
 */
export function RelationshipExplanation({
    strength,
    factors,
    skill1Label,
    skill2Label,
}: RelationshipExplanationProps) {
    const [isOpen, setIsOpen] = useState(false);

    const strengthPercent = Math.round(strength * 100);

    const factorItems = [
        { label: '동일 Enabler 소속', met: factors.sameEnabler, weight: '30%' },
        { label: 'knowledge/competence 동일', met: factors.sameType, weight: '20%' },
        { label: '중요도 유사 (차이 ≤ 1)', met: factors.similarImportance, weight: '20%' },
        { label: '목표 숙련도 동일', met: factors.sameProficiency, weight: '30%' },
    ];

    return (
        <div style={{ marginTop: '4px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#8892b0',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }}
            >
                <span style={{ fontWeight: 'bold', color: '#667eea' }}>
                    {strengthPercent}%
                </span>
                <span>{isOpen ? '▼' : '▶'} 관계 근거</span>
            </button>

            {isOpen && (
                <div
                    style={{
                        marginTop: '8px',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        lineHeight: '1.8',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <div style={{ marginBottom: '8px', color: '#ccd6f6' }}>
                        <strong>{skill1Label}</strong> ↔ <strong>{skill2Label}</strong>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: '#8892b0', fontSize: '11px' }}>
                                <th style={{ textAlign: 'left', padding: '2px 4px' }}>요인</th>
                                <th style={{ textAlign: 'center', padding: '2px 4px' }}>가중치</th>
                                <th style={{ textAlign: 'center', padding: '2px 4px' }}>충족</th>
                            </tr>
                        </thead>
                        <tbody>
                            {factorItems.map((item, i) => (
                                <tr key={i} style={{ color: item.met ? '#4ECDC4' : '#555' }}>
                                    <td style={{ padding: '2px 4px' }}>{item.label}</td>
                                    <td style={{ textAlign: 'center', padding: '2px 4px' }}>{item.weight}</td>
                                    <td style={{ textAlign: 'center', padding: '2px 4px' }}>
                                        {item.met ? '✓' : '✗'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div
                        style={{
                            marginTop: '8px',
                            color: '#a8b2d1',
                            fontSize: '11px',
                        }}
                    >
                        합산: <strong style={{ color: '#667eea' }}>{strengthPercent}%</strong>
                        {strength === 0 && (
                            <span style={{ color: '#FF6B6B' }}>
                                {' '}(임계값 미달로 연결 생략)
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * 데이터 품질 배지 - ESCO 매칭 유형 표시
 */
export function MatchTypeBadge({ matchType }: { matchType: 'exact' | 'approximate' | 'custom' }) {
    const config = {
        exact: { label: 'ESCO 정확 매칭', color: '#4ECDC4', bg: 'rgba(78,205,196,0.15)' },
        approximate: { label: 'ESCO 유사 매칭', color: '#FFA500', bg: 'rgba(255,165,0,0.15)' },
        custom: { label: '커스텀 스킬', color: '#FF6B6B', bg: 'rgba(255,107,107,0.15)' },
    };

    const { label, color, bg } = config[matchType];

    return (
        <span
            style={{
                display: 'inline-block',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '3px',
                background: bg,
                color: color,
                border: `1px solid ${color}30`,
            }}
        >
            {label}
        </span>
    );
}

/**
 * 데이터 품질 요약 - 조직 데이터의 ESCO 매칭 현황
 */
export function DataQualitySummary({
    exact,
    approximate,
    custom,
    total,
}: {
    exact: number;
    approximate: number;
    custom: number;
    total: number;
}) {
    const verifiedPercent = Math.round(((exact + approximate) / total) * 100);

    return (
        <div
            style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '13px',
            }}
        >
            <div style={{ marginBottom: '8px', color: '#ccd6f6', fontWeight: 'bold' }}>
                데이터 품질 현황
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <span style={{ color: '#4ECDC4' }}>정확 매칭: </span>
                    <strong>{exact}</strong>건
                </div>
                <div>
                    <span style={{ color: '#FFA500' }}>유사 매칭: </span>
                    <strong>{approximate}</strong>건
                </div>
                <div>
                    <span style={{ color: '#FF6B6B' }}>커스텀: </span>
                    <strong>{custom}</strong>건
                </div>
            </div>
            <div
                style={{
                    marginTop: '8px',
                    height: '6px',
                    borderRadius: '3px',
                    background: '#1a1a2e',
                    overflow: 'hidden',
                    display: 'flex',
                }}
            >
                <div
                    style={{
                        width: `${(exact / total) * 100}%`,
                        background: '#4ECDC4',
                    }}
                />
                <div
                    style={{
                        width: `${(approximate / total) * 100}%`,
                        background: '#FFA500',
                    }}
                />
                <div
                    style={{
                        width: `${(custom / total) * 100}%`,
                        background: '#FF6B6B',
                    }}
                />
            </div>
            <div style={{ marginTop: '6px', color: '#8892b0', fontSize: '11px' }}>
                ESCO 검증 완료율: <strong style={{ color: '#ccd6f6' }}>{verifiedPercent}%</strong>
                {' '}({exact + approximate}/{total}건)
            </div>
        </div>
    );
}
