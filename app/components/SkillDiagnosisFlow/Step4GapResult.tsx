'use client';

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

interface Step4Props {
  recommendedSkills: SkillRecommendation[];
  skillGap: SkillGap[];
  onNext: () => void;
  onRestart: () => void;
}

const PRIORITY_CONFIG = {
  high:   { label: '필수',  color: '#FF6B6B', bg: '#FF6B6B22' },
  medium: { label: '권장',  color: '#FFA500', bg: '#FFA50022' },
  low:    { label: '선택',  color: '#4ECDC4', bg: '#4ECDC422' },
};

const IMPORTANCE_CONFIG: Record<string, { color: string; bg: string }> = {
  '필수': { color: '#FF6B6B', bg: '#FF6B6B22' },
  '권장': { color: '#FFA500', bg: '#FFA50022' },
  '선택': { color: '#4ECDC4', bg: '#4ECDC422' },
};

export default function Step4GapResult({ recommendedSkills, skillGap, onNext, onRestart }: Step4Props) {
  const highCount = recommendedSkills.filter(s => s.priority === 'high').length;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📊</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          스킬 갭 분석 결과
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {highCount > 0
            ? `필수 스킬 ${highCount}개를 포함, 총 ${recommendedSkills.length}개 스킬이 권장됩니다`
            : `${recommendedSkills.length}개의 스킬이 권장됩니다`}
        </p>
      </div>

      {/* 요약 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        {(['high', 'medium', 'low'] as const).map(p => {
          const count = recommendedSkills.filter(s => s.priority === p).length;
          const cfg = PRIORITY_CONFIG[p];
          return (
            <div key={p} style={{
              padding: '1rem',
              background: cfg.bg,
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: cfg.color }}>{count}</div>
              <div style={{ fontSize: '0.8rem', color: cfg.color, fontWeight: 600 }}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* 추천 스킬 목록 */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          추천 스킬
        </h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {recommendedSkills.map((skill, idx) => {
            const cfg = PRIORITY_CONFIG[skill.priority];
            return (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '0.75rem 1rem',
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                border: `1px solid ${cfg.color}44`,
              }}>
                <span style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  background: cfg.bg,
                  color: cfg.color,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}>
                  {cfg.label}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {skill.skillName}
                    {skill.escoCode && (
                      <small style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 400 }}>
                        ESCO: {skill.escoCode}
                      </small>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    {skill.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 스킬 갭 */}
      {skillGap.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            핵심 부족 스킬
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {skillGap.map((gap, idx) => {
              const cfg = IMPORTANCE_CONFIG[gap.importance] || { color: '#888', bg: '#88888822' };
              return (
                <div key={idx} style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{gap.skillName}</span>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      background: cfg.bg,
                      color: cfg.color,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {gap.importance}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {gap.learningResources.map((resource, ridx) => (
                      <span key={ridx} style={{
                        padding: '0.2rem 0.6rem',
                        background: 'var(--color-primary)11',
                        color: 'var(--color-primary)',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                      }}>
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={onRestart}
          style={{
            flex: 1,
            padding: '0.9rem',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          다시 분석
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 2,
            padding: '0.9rem',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          학습 로드맵 보기 →
        </button>
      </div>
    </div>
  );
}
