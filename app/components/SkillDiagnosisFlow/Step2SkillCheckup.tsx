'use client';

// 도메인별로 체크할 수 있는 스킬 목록
const SKILL_OPTIONS = [
  {
    domain: '로봇 공학',
    icon: '🤖',
    skills: ['ROS / ROS2', '로봇 키네마틱스', '모션 플래닝', '엔드이펙터 설계', 'URDF 모델링'],
  },
  {
    domain: 'AI / 머신러닝',
    icon: '🧠',
    skills: ['Python', 'PyTorch', 'TensorFlow', '컴퓨터 비전', 'OpenCV', '강화학습'],
  },
  {
    domain: '제어 시스템',
    icon: '⚙️',
    skills: ['PLC 프로그래밍', 'HMI', 'SCADA', 'CNC', '서보 제어'],
  },
  {
    domain: '제조 / 공정',
    icon: '🏭',
    skills: ['MES', 'ERP 연동', '공정 설계', 'Lean Manufacturing', 'Six Sigma'],
  },
  {
    domain: '안전 / 통합',
    icon: '🛡️',
    skills: ['기능 안전 (ISO 13849)', '위험성 평가', 'CE 인증', '시스템 통합', 'IIoT'],
  },
];

interface Step2Props {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2SkillCheckup({ selectedSkills, onChange, onNext, onBack }: Step2Props) {
  const toggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter(s => s !== skill));
    } else {
      onChange([...selectedSkills, skill]);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔍</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          현재 보유한 스킬을 선택하세요
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          알고 있거나 경험한 스킬에 체크하세요. 없어도 괜찮습니다.
        </p>
      </div>

      {/* 선택된 스킬 카운트 */}
      <div style={{
        padding: '0.75rem 1rem',
        background: selectedSkills.length > 0 ? 'var(--color-primary)11' : 'var(--bg-tertiary)',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        color: selectedSkills.length > 0 ? 'var(--color-primary)' : 'var(--text-muted)',
        fontSize: '0.95rem',
        fontWeight: 500,
        transition: 'all 0.2s',
      }}>
        {selectedSkills.length > 0
          ? `✅ ${selectedSkills.length}개 선택됨: ${selectedSkills.slice(0, 3).join(', ')}${selectedSkills.length > 3 ? ' ...' : ''}`
          : '아직 선택된 스킬이 없습니다'}
      </div>

      {/* 도메인별 스킬 체크리스트 */}
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        {SKILL_OPTIONS.map((domain) => (
          <div
            key={domain.domain}
            style={{
              padding: '1.25rem',
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              fontWeight: 600,
            }}>
              <span style={{ fontSize: '1.2rem' }}>{domain.icon}</span>
              <span>{domain.domain}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {domain.skills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggle(skill)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '20px',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-color)'}`,
                      background: isSelected ? 'var(--color-primary)' : 'var(--bg-card)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{skill}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={onBack}
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
          ← 이전
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
          AI 분석 시작 →
        </button>
      </div>
    </div>
  );
}
