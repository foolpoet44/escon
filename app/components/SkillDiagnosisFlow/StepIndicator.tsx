'use client';

interface Step {
  number: number;
  label: string;
  icon: string;
}

const STEPS: Step[] = [
  { number: 1, label: '직무 입력', icon: '📝' },
  { number: 2, label: '스킬 파악', icon: '🔍' },
  { number: 3, label: 'AI 분석', icon: '🤖' },
  { number: 4, label: '갭 결과', icon: '📊' },
  { number: 5, label: '로드맵', icon: '🎯' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        position: 'relative',
      }}>
        {STEPS.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
              {/* 단계 원 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isActive ? '1.3rem' : '1.1rem',
                  fontWeight: 700,
                  background: isCompleted
                    ? 'var(--color-primary)'
                    : isActive
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                      : 'var(--bg-tertiary)',
                  color: isCompleted || isActive ? 'white' : 'var(--text-muted)',
                  border: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  boxShadow: isActive ? '0 0 0 4px var(--color-primary)22' : 'none',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}>
                  {isCompleted ? '✓' : step.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? 'var(--color-primary)' : isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                }}>
                  {step.label}
                </span>
              </div>

              {/* 연결선 (마지막 제외) */}
              {idx < STEPS.length - 1 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  background: step.number < currentStep
                    ? 'var(--color-primary)'
                    : 'var(--border-color)',
                  marginBottom: '1.5rem',
                  transition: 'background 0.3s ease',
                  flexShrink: 0,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
