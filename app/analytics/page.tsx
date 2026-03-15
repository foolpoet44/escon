'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { loadSkillsData, calculateStatistics, getAllSkills } from '../lib/skills-data';
import { Statistics, Skill } from '../lib/types';
import { DOMAINS } from '../lib/constants';
import ExportButton from '../components/ExportButton';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkillsData()
      .then((data) => {
        const statistics = calculateStatistics(data);
        const skills = getAllSkills(data);
        setStats(statistics);
        setAllSkills(skills);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load statistics:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="page-container">
        <div className="loading">분석 데이터 로딩 중...</div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="page-container">
        <div className="error">통계 데이터 로드 실패</div>
      </main>
    );
  }

  const skillTypeData = [
    { name: '지식', value: stats.knowledgeSkills, color: '#4ECDC4' },
    { name: '역량', value: stats.competenceSkills, color: '#667eea' }
  ];

  const domainData = stats.domainDistribution.map((item, index) => ({
    ...item,
    color: DOMAINS[index]?.color || '#667eea'
  }));

  return (
    <main className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">분석 대시보드</h1>
          <p className="page-description">
            ESCO 스킬 온톨로지의 통계 인사이트와 시각화
          </p>
        </div>
        <ExportButton skills={allSkills} filename="all_skills_analytics" label="전체 데이터 내보내기" />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSkills.toLocaleString()}</div>
            <div className="stat-label">전체 스킬</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📂</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDomains}</div>
            <div className="stat-label">도메인</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🧠</div>
          <div className="stat-content">
            <div className="stat-value">{stats.knowledgeSkills.toLocaleString()}</div>
            <div className="stat-label">지식 스킬</div>
            <div className="stat-percentage">
              {((stats.knowledgeSkills / stats.totalSkills) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{stats.competenceSkills.toLocaleString()}</div>
            <div className="stat-label">역량 스킬</div>
            <div className="stat-percentage">
              {((stats.competenceSkills / stats.totalSkills) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-title">스킬 타입 분포</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skillTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {skillTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card-wide">
          <h2 className="chart-title">도메인별 스킬</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={domainData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="domain" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#667eea">
                {domainData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insights-section">
        <h2 className="insights-title">Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🏆</div>
            <h3>Largest Domain</h3>
            <p>
              <strong>AI & ML</strong> is the largest domain with{' '}
              <strong>{domainData.find(d => d.domain === 'AI & ML')?.count || 0}</strong> skills,
              representing the growing importance of artificial intelligence
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-icon">⚖️</div>
            <h3>Skill Balance</h3>
            <p>
              The ontology maintains a balance with{' '}
              <strong>{((stats.competenceSkills / stats.totalSkills) * 100).toFixed(1)}%</strong>{' '}
              practical competencies and{' '}
              <strong>{((stats.knowledgeSkills / stats.totalSkills) * 100).toFixed(1)}%</strong>{' '}
              theoretical knowledge
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <h3>Coverage</h3>
            <p>
              With <strong>{stats.totalDomains}</strong> specialized domains covering{' '}
              <strong>{stats.totalSkills.toLocaleString()}</strong> skills, the ontology provides
                comprehensive coverage of factory robotics competencies
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-2xl);
          gap: var(--spacing-lg);
        }

        .header-content {
          flex-grow: 1;
        }

        .page-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--spacing-md);
        }

        .page-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }

        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          transition: all var(--transition-base);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .stat-icon {
          font-size: 3rem;
        }

        .stat-content {
          flex-grow: 1;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--color-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-percentage {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }

        .chart-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
        }

        .chart-card-wide {
          grid-column: 1 / -1;
        }

        .chart-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-lg) 0;
        }

        .insights-section {
          margin-top: var(--spacing-2xl);
        }

        .insights-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .insight-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
        }

        .insight-icon {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-md);
        }

        .insight-card h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .insight-card p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .insight-card strong {
          color: var(--color-primary);
        }

        .loading, .error {
          text-align: center;
          padding: var(--spacing-2xl);
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
