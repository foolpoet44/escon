'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { DomainKey, SkillsData } from '../lib/types';
import { DOMAINS } from '../lib/constants';
import { loadSkillsData, getSkillsByDomain } from '../lib/skills-data';
import { compareDomains, ComparisonResult } from '../lib/comparison';
import DomainSelector from '../components/DomainSelector';
import ComparisonChart from '../components/ComparisonChart';

export default function ComparePage() {
  const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [domain1, setDomain1] = useState<DomainKey | ''>('');
  const [domain2, setDomain2] = useState<DomainKey | ''>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  useEffect(() => {
    loadSkillsData()
      .then(data => {
        setSkillsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load skills data", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (skillsData && domain1 && domain2) {
      const d1Info = DOMAINS.find(d => d.key === domain1);
      const d2Info = DOMAINS.find(d => d.key === domain2);

      if (d1Info && d2Info) {
        const skills1 = getSkillsByDomain(skillsData, domain1);
        const skills2 = getSkillsByDomain(skillsData, domain2);

        const result = compareDomains(
          domain1, d1Info.name, skills1,
          domain2, d2Info.name, skills2
        );
        setComparisonResult(result);
      }
    } else {
      setComparisonResult(null);
    }
  }, [skillsData, domain1, domain2]);

  if (loading) {
    return <LoadingSpinner text="데이터 로딩 중..." />;
  }

  return (
    <div className="compare-page">
      <div className="header">
        <h1>⚖️ 도메인 비교 분석</h1>
        <p>두 도메인 간의 스킬 구성과 유사도를 비교 분석합니다.</p>
      </div>

      <div className="selector-section">
        <DomainSelector
          selectedDomain1={domain1}
          selectedDomain2={domain2}
          onSelectDomain1={setDomain1}
          onSelectDomain2={setDomain2}
        />
      </div>

      {comparisonResult ? (
        <div className="results-container">
          <div className="similarity-card">
            <h3>유사도 점수 (Jaccard Similarity)</h3>
            <div className="score">
              {(comparisonResult.similarityScore * 100).toFixed(1)}%
            </div>
            <p>두 도메인 간의 스킬 구성 유사성</p>
          </div>

          <ComparisonChart result={comparisonResult} />

          <div className="common-skills-section">
            <h3>🔗 공통 스킬 ({comparisonResult.commonCount}개)</h3>
            {comparisonResult.commonCount > 0 ? (
              <div className="skills-grid">
                {comparisonResult.commonSkills.map(skill => (
                  <div key={skill.uri} className="skill-card">
                    <div
                      className="skill-type"
                      style={{
                        backgroundColor: skill.type === 'knowledge' ? '#4ECDC4' : '#FFA500'
                      }}
                    >
                      {skill.type === 'knowledge' ? 'K' : 'S'}
                    </div>
                    <div className="skill-name">{skill.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">공통된 스킬이 없습니다.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="placeholder-message">
          비교할 두 도메인을 선택해주세요.
        </div>
      )}

      <style jsx>{`
                .compare-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                    min-height: 100vh;
                    background-color: var(--bg-primary);
                }
                .header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                .header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .header p {
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }
                .loading-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    font-size: 1.2rem;
                    color: var(--text-secondary);
                }
                .placeholder-message {
                    text-align: center;
                    padding: 4rem;
                    background: var(--bg-card);
                    border-radius: 12px;
                    color: var(--text-secondary);
                    border: 2px dashed var(--border-color);
                }
                .results-container {
                    animation: fadeIn 0.5s ease-out;
                }
                .similarity-card {
                    background: var(--bg-card);
                    padding: 1.5rem;
                    border-radius: 12px;
                    text-align: center;
                    margin-bottom: 2rem;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border-color);
                }
                .similarity-card h3 {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                }
                .similarity-card .score {
                    font-size: 3rem;
                    font-weight: 800;
                    color: var(--color-primary);
                }
                .common-skills-section {
                    margin-top: 3rem;
                }
                .common-skills-section h3 {
                    margin-bottom: 1.5rem;
                    font-size: 1.25rem;
                    color: var(--text-primary);
                }
                .skills-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1rem;
                }
                .skill-card {
                    background: var(--bg-tertiary);
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    border: 1px solid var(--border-color);
                    transition: transform 0.2s;
                }
                .skill-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-sm);
                }
                .skill-type {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: bold;
                    color: white;
                    flex-shrink: 0;
                }
                .skill-name {
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    line-height: 1.4;
                    word-break: break-word;
                }
                .no-data {
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 2rem;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
    </div>
  );
}
