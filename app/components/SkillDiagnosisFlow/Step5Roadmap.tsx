'use client';

interface CareerPath {
  shortTerm: string[];
  midTerm: string[];
  longTerm: string[];
}

interface Step5Props {
  careerPath: CareerPath;
  jobDescription: string;
  selectedSkills: string[];
  onRestart: () => void;
}

const PHASE_CONFIG = [
  {
    key: 'shortTerm' as const,
    label: '단기 목표',
    period: '1 ~ 3개월',
    icon: '🌱',
    color: 'var(--color-primary)',
    bg: 'var(--color-primary)11',
    borderColor: 'var(--color-primary)44',
  },
  {
    key: 'midTerm' as const,
    label: '중기 목표',
    period: '3 ~ 6개월',
    icon: '📈',
    color: 'var(--color-secondary)',
    bg: 'var(--color-secondary)11',
    borderColor: 'var(--color-secondary)44',
  },
  {
    key: 'longTerm' as const,
    label: '장기 목표',
    period: '6 ~ 12개월',
    icon: '🏆',
    color: 'var(--color-accent)',
    bg: 'var(--color-accent)11',
    borderColor: 'var(--color-accent)44',
  },
];

export default function Step5Roadmap({ careerPath, jobDescription, selectedSkills, onRestart }: Step5Props) {
  const handleCopyResult = () => {
    const text = `
=== AI 스킬 매칭 결과 ===

[직무 설명 요약]
${jobDescription.slice(0, 100)}...

[현재 보유 스킬]
${selectedSkills.join(', ') || '없음'}

[단기 목표 (1-3개월)]
${careerPath.shortTerm.map(t => `• ${t}`).join('\n')}

[중기 목표 (3-6개월)]
${careerPath.midTerm.map(t => `• ${t}`).join('\n')}

[장기 목표 (6-12개월)]
${careerPath.longTerm.map(t => `• ${t}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      alert('로드맵이 클립보드에 복사되었습니다.');
    });
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎯</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          개인화 학습 로드맵
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          지금부터 12개월의 성장 경로입니다
        </p>
      </div>

      {/* 타임라인 로드맵 */}
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {PHASE_CONFIG.map((phase, idx) => (
          <div
            key={phase.key}
            style={{
              padding: '1.5rem',
              background: phase.bg,
              border: `1px solid ${phase.borderColor}`,
              borderRadius: '12px',
              position: 'relative',
            }}
          >
            {/* 단계 번호 + 라벨 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: phase.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: phase.color }}>
                  {phase.icon} {phase.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {phase.period}
                </div>
              </div>
            </div>

            {/* 목표 리스트 */}
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: '0.4rem' }}>
              {careerPath[phase.key].map((item, itemIdx) => (
                <li key={itemIdx} style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 현재 스킬 요약 */}
      {selectedSkills.length > 0 && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            기반 스킬 ({selectedSkills.length}개)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {selectedSkills.map(skill => (
              <span key={skill} style={{
                padding: '0.2rem 0.6rem',
                background: 'var(--color-primary)22',
                color: 'var(--color-primary)',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}>
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <button
          onClick={handleCopyResult}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📋 로드맵 복사
        </button>
        <button
          onClick={onRestart}
          style={{
            width: '100%',
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
          다른 직무 분석하기
        </button>
      </div>
    </div>
  );
}
