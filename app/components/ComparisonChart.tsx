"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DomainComparison } from '../lib/comparison';
import { DOMAINS } from '../lib/constants';

interface ComparisonChartProps {
    comparison: DomainComparison;
}

export default function ComparisonChart({ comparison }: ComparisonChartProps) {
    const domain1Color = DOMAINS.find(d => d.key === comparison.domain1)?.color || '#667eea';
    const domain2Color = DOMAINS.find(d => d.key === comparison.domain2)?.color || '#4ECDC4';

    // 스킬 수 비교 데이터
    const skillCountData = [
        {
            name: 'Total Skills',
            [comparison.domain1Name]: comparison.domain1Count,
            [comparison.domain2Name]: comparison.domain2Count
        },
        {
            name: 'Knowledge',
            [comparison.domain1Name]: comparison.domain1Knowledge,
            [comparison.domain2Name]: comparison.domain2Knowledge
        },
        {
            name: 'Competence',
            [comparison.domain1Name]: comparison.domain1Competence,
            [comparison.domain2Name]: comparison.domain2Competence
        }
    ];

    // 공통/고유 스킬 데이터
    const overlapData = [
        { name: `Unique to ${comparison.domain1Name}`, value: comparison.uniqueToDomain1.length, color: domain1Color },
        { name: 'Common Skills', value: comparison.commonSkills.length, color: '#98D8C8' },
        { name: `Unique to ${comparison.domain2Name}`, value: comparison.uniqueToDomain2.length, color: domain2Color }
    ];

    // 유사도 계산
    const totalUnique = comparison.domain1Count + comparison.domain2Count - comparison.commonSkills.length;
    const similarity = totalUnique === 0 ? 0 : (comparison.commonSkills.length / totalUnique) * 100;

    return (
        <div className="comparison-chart">
            {/* 요약 통계 */}
            <div className="stats-summary">
                <div className="stat-card">
                    <div className="stat-icon">🔗</div>
                    <div className="stat-content">
                        <div className="stat-value">{comparison.commonSkills.length}</div>
                        <div className="stat-label">Common Skills</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">{similarity.toFixed(1)}%</div>
                        <div className="stat-label">Similarity (Jaccard)</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <div className="stat-value">{comparison.uniqueToDomain1.length}</div>
                        <div className="stat-label">Unique to {comparison.domain1Name}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <div className="stat-value">{comparison.uniqueToDomain2.length}</div>
                        <div className="stat-label">Unique to {comparison.domain2Name}</div>
                    </div>
                </div>
            </div>

            {/* 차트 그리드 */}
            <div className="charts-grid">
                {/* 스킬 수 비교 바 차트 */}
                <div className="chart-container">
                    <h3 className="chart-title">Skill Count Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={skillCountData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#aaa" />
                            <YAxis stroke="#aaa" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a2e',
                                    border: '1px solid #333',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Bar dataKey={comparison.domain1Name} fill={domain1Color} />
                            <Bar dataKey={comparison.domain2Name} fill={domain2Color} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 공통/고유 스킬 파이 차트 */}
                <div className="chart-container">
                    <h3 className="chart-title">Skill Overlap Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={overlapData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {overlapData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a2e',
                                    border: '1px solid #333',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <style jsx>{`
        .comparison-chart {
          margin-top: var(--spacing-xl);
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content {
          flex-grow: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: var(--spacing-xs);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--spacing-xl);
        }

        .chart-container {
          background: var(--bg-card);
          padding: var(--spacing-xl);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
        }

        @media (max-width: 768px) {
          .stats-summary {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}
