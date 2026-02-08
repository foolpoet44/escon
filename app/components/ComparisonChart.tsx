'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { ComparisonResult } from '../lib/comparison';

interface ComparisonChartProps {
    result: ComparisonResult;
}

const COLORS = {
    knowledge: '#4ECDC4',
    competence: '#FFA500',
    domain1: '#FF6B6B',
    domain2: '#1A535C',
    common: '#FFE66D'
};

export default function ComparisonChart({ result }: ComparisonChartProps) {

    // Bar Chart Data
    const countData = [
        {
            name: '전체 스킬',
            [result.domain1Name]: result.totalSkills1,
            [result.domain2Name]: result.totalSkills2,
        },
        {
            name: '고유 스킬',
            [result.domain1Name]: result.uniqueCount1,
            [result.domain2Name]: result.uniqueCount2,
        }
    ];

    const typeData1 = [
        { name: 'Knowledge', value: result.typeDistribution1.knowledge },
        { name: 'Competence', value: result.typeDistribution1['skill/competence'] }
    ];

    const typeData2 = [
        { name: 'Knowledge', value: result.typeDistribution2.knowledge },
        { name: 'Competence', value: result.typeDistribution2['skill/competence'] }
    ];

    return (
        <div className="comparison-charts">
            <div className="chart-section">
                <h3>📊 스킬 수 비교</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={countData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            />
                            <Legend />
                            <Bar dataKey={result.domain1Name} fill={COLORS.domain1} radius={[4, 4, 0, 0]} />
                            <Bar dataKey={result.domain2Name} fill={COLORS.domain2} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-section">
                <h3>🧩 스킬 유형 분포</h3>
                <div className="pie-charts-row">
                    <div className="pie-chart-wrapper">
                        <h4>{result.domain1Name}</h4>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={typeData1}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell key="knowledge" fill={COLORS.knowledge} />
                                        <Cell key="competence" fill={COLORS.competence} />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="distribution-stats">
                            <div>Knowledge: {result.typeDistribution1.knowledge}</div>
                            <div>Competence: {result.typeDistribution1['skill/competence']}</div>
                        </div>
                    </div>

                    <div className="pie-chart-wrapper">
                        <h4>{result.domain2Name}</h4>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={typeData2}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell key="knowledge" fill={COLORS.knowledge} />
                                        <Cell key="competence" fill={COLORS.competence} />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="distribution-stats">
                            <div>Knowledge: {result.typeDistribution2.knowledge}</div>
                            <div>Competence: {result.typeDistribution2['skill/competence']}</div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .comparison-charts {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .chart-section {
                    background: var(--bg-card);
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border-color);
                }
                .chart-section h3 {
                    margin-bottom: 1.5rem;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                }
                .pie-charts-row {
                    display: flex;
                    gap: 2rem;
                }
                .pie-chart-wrapper {
                    flex: 1;
                    text-align: center;
                    background: var(--bg-tertiary);
                    padding: 1rem;
                    border-radius: 8px;
                }
                .pie-chart-wrapper h4 {
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                    font-weight: 600;
                }
                .distribution-stats {
                    margin-top: 1rem;
                    display: flex;
                    justify-content: center;
                    gap: 1.5rem;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                @media (max-width: 768px) {
                    .pie-charts-row {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}
