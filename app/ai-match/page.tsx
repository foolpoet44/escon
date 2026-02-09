'use client';

import { useState } from 'react';

interface SkillRecommendation {
  skillName: string;
  escoCode?: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

interface SkillGap {
  skillName: string;
  importance: string;
  learningResources: string[];
}

interface CareerPath {
  shortTerm: string[];
  midTerm: string[];
  longTerm: string[];
}

interface AIAnalysisResult {
  recommendedSkills: SkillRecommendation[];
  skillGap: SkillGap[];
  careerPath: CareerPath;
}

export default function AISkillMatcher() {
  const [jobDescription, setJobDescription] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeSkills = async () => {
    if (!jobDescription.trim()) {
      setError('직무 설명을 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/match-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          currentSkills: currentSkills.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError('스킬 분석 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFA500';
      case 'low': return '#4ECDC4';
      default: return '#888';
    }
  };

  return (
    <div className="ai-skill-matcher" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
          🤖 AI 스킬 매칭
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Gemini 2.5 AI가 직무 설명을 분석하여 필요한 스킬을 추천합니다
        </p>
      </div>

      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: '16px', 
        padding: '2rem',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            채용 공고 또는 직무 설명
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="채용 공고 내용을 붙여넣거나 직무 설명을 입력하세요...&#10;&#10;예: 협동로봇 엔지니어로서 Python과 ROS를 활용하여 자동화 솔루션을 개발합니다. 머신러닝 기반 비전 시스템 경험者优先."
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            현재 보유 스킬 (선택사항)
          </label>
          <input
            type="text"
            value={currentSkills}
            onChange={(e) => setCurrentSkills(e.target.value)}
            placeholder="Python, ROS, OpenCV, ..."
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
            }}
          />
          <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
            쉼표로 구분하여 입력하세요
          </small>
        </div>

        <button
          onClick={analyzeSkills}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem',
            background: loading ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? '🔍 분석 중...' : '✨ AI 스킬 분석 시작'}
        </button>

        {error && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#FF6B6B22', 
            border: '1px solid #FF6B6B',
            borderRadius: '8px',
            color: '#FF6B6B'
          }}>
            {error}
          </div>
        )}
      </div>

      {result && (
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div style={{ 
            background: 'var(--bg-card)', 
            borderRadius: '16px', 
            padding: '2rem',
            border: '1px solid var(--border-color)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              📋 추천 스킬
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {result.recommendedSkills.map((skill, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
                      {skill.skillName}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: getPriorityColor(skill.priority) + '22',
                      color: getPriorityColor(skill.priority),
                    }}>
                      {skill.priority === 'high' ? '필수' : skill.priority === 'medium' ? '권장' : '선택'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0', fontSize: '0.95rem' }}>
                    {skill.reason}
                  </p>
                  {skill.escoCode && (
                    <small style={{ color: 'var(--text-muted)' }}>
                      ESCO: {skill.escoCode}
                    </small>
                  )}
                </div>
              ))}
            </div>
          </div>

          {result.skillGap.length > 0 && (
            <div style={{ 
              background: 'var(--bg-card)', 
              borderRadius: '16px', 
              padding: '2rem',
              border: '1px solid var(--border-color)'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                ⚠️ 스킬 갭 분석
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {result.skillGap.map((gap, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: '1.5rem',
                      background: 'var(--bg-primary)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {gap.skillName}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      중요도: {gap.importance}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {gap.learningResources.map((resource, ridx) => (
                        <span 
                          key={ridx}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: 'var(--color-primary)22',
                            color: 'var(--color-primary)',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                          }}
                        >
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ 
            background: 'var(--bg-card)', 
            borderRadius: '16px', 
            padding: '2rem',
            border: '1px solid var(--border-color)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              🎯 커리어 로드맵
            </h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                  단기 (1-3개월)
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  {result.careerPath.shortTerm.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-secondary)', marginBottom: '0.75rem' }}>
                  중기 (3-6개월)
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  {result.careerPath.midTerm.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-accent)', marginBottom: '0.75rem' }}>
                  장기 (6-12개월)
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                  {result.careerPath.longTerm.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
