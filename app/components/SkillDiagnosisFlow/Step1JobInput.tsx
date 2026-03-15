'use client';

// 자주 쓰이는 직무 예시 - 사용자가 빠르게 선택하거나 직접 입력 가능
const JOB_PRESETS = [
  { label: '협동로봇 엔지니어', text: '협동로봇(Cobot) 시스템 설계 및 프로그래밍. ROS 기반 모션 플래닝, 안전 기능 설계, PLC 연동 경험 필요.' },
  { label: 'AI 비전 엔지니어', text: '제조 라인 비전 검사 시스템 개발. OpenCV, PyTorch 기반 딥러닝 모델 설계 및 배포. 결함 탐지 알고리즘 구현.' },
  { label: '스마트팩토리 솔루션 아키텍트', text: '스마트팩토리 AX 전환 전략 수립. MES/ERP 시스템 연동, IIoT 플랫폼 설계, 데이터 파이프라인 구축.' },
  { label: 'ROS 로봇 소프트웨어 엔지니어', text: 'ROS2 기반 자율이동로봇(AMR) 소프트웨어 개발. SLAM, 경로계획, 센서 퓨전. C++/Python 구현.' },
];

interface Step1Props {
  jobDescription: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export default function Step1JobInput({ jobDescription, onChange, onNext }: Step1Props) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📝</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          어떤 직무를 분석할까요?
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          채용공고나 직무 설명을 입력하거나, 아래 예시를 선택하세요.
        </p>
      </div>

      {/* 빠른 선택 프리셋 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {JOB_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange(preset.text)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: `1px solid ${jobDescription === preset.text ? 'var(--color-primary)' : 'var(--border-color)'}`,
              background: jobDescription === preset.text ? 'var(--color-primary)22' : 'var(--bg-tertiary)',
              color: jobDescription === preset.text ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 직접 입력 */}
      <textarea
        value={jobDescription}
        onChange={(e) => onChange(e.target.value)}
        placeholder="채용공고 내용을 붙여넣거나 직무 설명을 직접 입력하세요..."
        style={{
          width: '100%',
          minHeight: '180px',
          padding: '1rem',
          borderRadius: '8px',
          border: `1px solid ${jobDescription ? 'var(--color-primary)' : 'var(--border-color)'}`,
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontSize: '1rem',
          resize: 'vertical',
          transition: 'border-color 0.2s',
          outline: 'none',
          fontFamily: 'inherit',
          lineHeight: 1.6,
        }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.5rem',
      }}>
        <small style={{ color: 'var(--text-muted)' }}>
          {jobDescription.length}자 입력됨
        </small>
        <small style={{ color: 'var(--text-muted)' }}>
          100자 이상 권장
        </small>
      </div>

      <button
        onClick={onNext}
        disabled={jobDescription.trim().length < 10}
        style={{
          width: '100%',
          padding: '1rem',
          marginTop: '1.5rem',
          background: jobDescription.trim().length >= 10
            ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
            : 'var(--bg-tertiary)',
          color: jobDescription.trim().length >= 10 ? 'white' : 'var(--text-muted)',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.05rem',
          fontWeight: 600,
          cursor: jobDescription.trim().length >= 10 ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s',
        }}
      >
        다음: 현재 스킬 확인 →
      </button>
    </div>
  );
}
