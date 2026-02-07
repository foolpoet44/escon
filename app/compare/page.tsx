"use client";

import { useState, useEffect } from 'react';
import { DomainKey, SkillsData } from '../lib/types';
import { loadSkillsData } from '../lib/skills-data';
import { compareDomains, DomainComparison } from '../lib/comparison';
import DomainSelector from '../components/DomainSelector';
import ComparisonChart from '../components/ComparisonChart';
import SkillCard from '../components/SkillCard';
import ExportButton from '../components/ExportButton';

export default function ComparePage() {
  const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<DomainKey[]>([]);
  const [comparison, setComparison] = useState<DomainComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'common' | 'unique1' | 'unique2'>('common');

  useEffect(() => {
    loadSkillsData()
      .then((data) => {
        setSkillsData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load skills data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (skillsData && selectedDomains.length === 2) {
      const result = compareDomains(skillsData, selectedDomains[0], selectedDomains[1]);
      setComparison(result);
      setActiveTab('common');
    } else {
      setComparison(null);
    }
  }, [selectedDomains, skillsData]);

  if (loading) {
    return (
      <main className="page-container">
        <div className="loading">비교 도구 로딩 중...</div>
      </main>
    );
  }

  const getActiveSkills = () => {
    if (!comparison) return [];
    switch (activeTab) {
      case 'common':
        return comparison.commonSkills;
      case 'unique1':
        return comparison.uniqueToDomain1;
      case 'unique2':
        return comparison.uniqueToDomain2;
      default:
        return [];
    }
  };

  const activeSkills = getActiveSkills();

  return (
    <main className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">도메인 비교</h1>
          <p className="page-description">
            서로 다른 도메인 간 스킬을 비교하여 중복 및 고유 역량을 파악하세요
          </p>
        </div>
      </div>

      <DomainSelector
        selectedDomains={selectedDomains}
        onDomainChange={setSelectedDomains}
        maxSelections={2}
      />

      {selectedDomains.length < 2 && (
        <div className="instruction-card">
          <span className="instruction-icon">👆</span>
          <div className="instruction-content">
            <h3>시작하기</h3>
            <p>위에서 2개 도메인을 선택하여 스킬과 역량을 비교하세요</p>
          </div>
        </div>
      )}

      {comparison && (
        <>
          <ComparisonChart comparison={comparison} />

          <div className="skills-section">
            <div className="section-header">
              <h2 className="section-title">상세 스킬 분석</h2>
              <ExportButton
                skills={activeSkills}
                filename={`comparison_${activeTab}_skills`}
                label="현재 보기 내보내기"
              />
            </div>

            <div className="tabs">
              <button
                className={`tab ${activeTab === 'common' ? 'active' : ''}`}
                onClick={() => setActiveTab('common')}
              >
                <span className="tab-icon">🔗</span>
                공통 스킬 ({comparison.commonSkills.length})
              </button>
              <button
                className={`tab ${activeTab === 'unique1' ? 'active' : ''}`}
                onClick={() => setActiveTab('unique1')}
              >
                <span className="tab-icon">🎯</span>
                {comparison.domain1Name} 고유 ({comparison.uniqueToDomain1.length})
              </button>
              <button
                className={`tab ${activeTab === 'unique2' ? 'active' : ''}`}
                onClick={() => setActiveTab('unique2')}
              >
                <span className="tab-icon">🎯</span>
                {comparison.domain2Name} 고유 ({comparison.uniqueToDomain2.length})
              </button>
            </div>

            <div className="skills-grid">
              {activeSkills.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>이 카테고리에서 스킬을 찾을 수 없습니다</p>
                </div>
              ) : (
                activeSkills.map((skill) => (
                  <SkillCard key={skill.uri} skill={skill} />
                ))
              )}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .page-header {
          margin-bottom: var(--spacing-2xl);
        }

        .header-content {
          text-align: center;
        }

        .page-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--spacing-sm);
        }

        .page-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .instruction-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-2xl);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 2px dashed var(--border-color);
          margin: var(--spacing-2xl) 0;
        }

        .instruction-icon {
          font-size: 3rem;
        }

        .instruction-content h3 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .instruction-content p {
          color: var(--text-secondary);
        }

        .skills-section {
          margin-top: var(--spacing-2xl);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .tabs {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
          border-bottom: 2px solid var(--border-color);
          overflow-x: auto;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-md) var(--spacing-lg);
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: all var(--transition-base);
          color: var(--text-secondary);
          font-weight: 600;
          white-space: nowrap;
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .tab.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--text-muted);
        }

        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: var(--spacing-md);
        }

        .loading {
          text-align: center;
          padding: var(--spacing-2xl);
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .instruction-card {
            flex-direction: column;
            text-align: center;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-md);
          }

          .tabs {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}
