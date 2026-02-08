'use client';

export default function SkillsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          스킬 탐색기
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          이 기능은 현재 개발 중입니다. Phase 2의 다음 단계에서 구현될 예정입니다.
        </p>
        <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            📋 예정된 기능
          </h3>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
            <li>전체 스킬 검색 및 필터링</li>
            <li>도메인별 스킬 분류</li>
            <li>스킬 타입별 필터 (지식/역량)</li>
            <li>페이지네이션</li>
            <li>스킬 데이터 내보내기</li>
          </ul>
        </div>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            ← 홈으로
          </a>
          <a
            href="/organizations/robot-solution"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            조직 스킬 보기 →
          </a>
        </div>
      </div>
    </div>
  );
}
