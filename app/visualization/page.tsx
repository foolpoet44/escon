'use client';

/**
 * 시각화 페이지
 *
 * 3개 탭으로 구성:
 * 1. 스킬 분포  - 도메인별 스킬 수 SVG 바 차트 + 요약 통계
 * 2. 도메인 관계도 - Mermaid 그래프 (도메인 간 의존 관계)
 * 3. 온톨로지 구조 - Mermaid 플로우차트 (스마트팩토리 AX 분류 체계)
 *
 * 기존 자산 활용:
 * - DOMAINS 상수 (skillCount 포함) → 바 차트 데이터
 * - MermaidChart.tsx → Mermaid 다이어그램 렌더링
 * - 추가 라이브러리 없이 순수 SVG로 차트 구현
 */

import { useState } from 'react';
import MermaidChart from '../components/MermaidChart';
import { DOMAINS } from '../lib/constants';

// ── 탭 정의 ──────────────────────────────────────────
const TABS = [
  { id: 'distribution', label: '스킬 분포', icon: '📊' },
  { id: 'relations',    label: '도메인 관계도', icon: '🕸️' },
  { id: 'ontology',     label: '온톨로지 구조', icon: '🌳' },
] as const;
type TabId = typeof TABS[number]['id'];

// ── Mermaid 다이어그램 정의 ─────────────────────────────

// 도메인 간 의존/연계 관계도
const DOMAIN_RELATION_CHART = `
graph TD
    AI["🧠 AI & ML\\n(3,472 skills)"]
    PER["👁️ Perception\\n(593 skills)"]
    MFG["🏭 Manufacturing\\n(561 skills)"]
    MEC["⚙️ Mechatronics\\n(234 skills)"]
    SAF["🛡️ Safety\\n(99 skills)"]
    MAN["🦾 Manipulation\\n(81 skills)"]
    ROB["🤖 Robotics\\n(72 skills)"]
    NAV["🧭 Navigation\\n(69 skills)"]
    INT["🔗 Integration\\n(62 skills)"]
    CTL["🎮 Control\\n(155 skills)"]

    PER -->|"센서 데이터 공급"| AI
    AI  -->|"지능형 제어"| CTL
    AI  -->|"자율 경로계획"| NAV
    AI  -->|"스마트 조작"| MAN
    CTL -->|"구동 명령"| ROB
    MEC -->|"하드웨어 기반"| ROB
    ROB -->|"물체 조작"| MAN
    NAV -->|"이동 실행"| ROB
    INT -->|"시스템 연동"| MFG
    SAF -.->|"안전 규격 적용"| ROB
    SAF -.->|"안전 규격 적용"| MAN
    SAF -.->|"안전 규격 적용"| CTL

    style AI  fill:#98D8C8,stroke:#4ECDC4,color:#000
    style PER fill:#4ECDC4,stroke:#2EA8A0,color:#000
    style MFG fill:#F7DC6F,stroke:#D4AC0D,color:#000
    style MEC fill:#FFA07A,stroke:#E07050,color:#000
    style SAF fill:#F8B739,stroke:#D4900D,color:#000
    style MAN fill:#BB8FCE,stroke:#9B6FAE,color:#000
    style ROB fill:#FF6B6B,stroke:#CC4444,color:#000
    style NAV fill:#85C1E2,stroke:#5AA0C2,color:#000
    style INT fill:#52B788,stroke:#2E8A60,color:#000
    style CTL fill:#45B7D1,stroke:#2090B0,color:#000
`;

// 스마트팩토리 AX 온톨로지 분류 구조
const ONTOLOGY_CHART = `
flowchart TD
    ROOT["🏭 스마트팩토리 AX 스킬 온톨로지"]

    ROOT --> PERCEIVE["👁️ 인지 레이어\\nPerception Layer"]
    ROOT --> REASON["🧠 추론 레이어\\nReasoning Layer"]
    ROOT --> ACT["🦾 실행 레이어\\nAction Layer"]
    ROOT --> INFRA["🔗 인프라 레이어\\nInfrastructure Layer"]

    PERCEIVE --> P1["센서 시스템\\n(LiDAR, Camera, IMU)"]
    PERCEIVE --> P2["컴퓨터 비전\\n(Detection, Segmentation)"]
    PERCEIVE --> P3["환경 인식\\n(SLAM, Mapping)"]

    REASON --> R1["기계학습\\n(Supervised, Unsupervised)"]
    REASON --> R2["딥러닝\\n(CNN, RNN, Transformer)"]
    REASON --> R3["강화학습\\n(Policy, Reward)"]
    REASON --> R4["경로·작업 계획\\n(Planning, Scheduling)"]

    ACT --> A1["로봇 제어\\n(PID, 모션제어)"]
    ACT --> A2["조작·핸들링\\n(그리핑, EOAT)"]
    ACT --> A3["자율 항법\\n(AMR, AGV)"]
    ACT --> A4["메카트로닉스\\n(유공압, 구동)"]

    INFRA --> I1["시스템 통합\\n(MES, ERP, SCADA)"]
    INFRA --> I2["기능 안전\\n(ISO 13849, CE)"]
    INFRA --> I3["제조 공정\\n(Lean, QC)"]

    style ROOT fill:#667eea,stroke:#4C5EBD,color:#fff
    style PERCEIVE fill:#4ECDC4,stroke:#2EA8A0,color:#000
    style REASON fill:#98D8C8,stroke:#4ECDC4,color:#000
    style ACT fill:#FF6B6B,stroke:#CC4444,color:#000
    style INFRA fill:#52B788,stroke:#2E8A60,color:#000
`;

// ── SVG 바 차트 컴포넌트 ──────────────────────────────────

function DomainBarChart() {
  const [hovered, setHovered] = useState<string | null>(null);

  // skillCount 기준 내림차순 정렬
  const sorted = [...DOMAINS].sort((a, b) => b.skillCount - a.skillCount);
  const maxCount = sorted[0].skillCount;
  const total = sorted.reduce((s, d) => s + d.skillCount, 0);

  const BAR_HEIGHT = 36;
  const GAP = 10;
  const LABEL_W = 140;
  const BAR_MAX_W = 400;
  const SVG_W = LABEL_W + BAR_MAX_W + 80;
  const SVG_H = sorted.length * (BAR_HEIGHT + GAP) + 20;

  const handleExport = () => {
    const svgEl = document.getElementById('domain-bar-svg');
    if (!svgEl) return;
    const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'escon-domain-distribution.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* 요약 통계 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: '전체 스킬', value: total.toLocaleString(), icon: '⚡' },
          { label: '도메인 수', value: '10', icon: '📂' },
          { label: '최대 도메인', value: 'AI & ML', icon: '🧠' },
          { label: '평균 스킬/도메인', value: Math.round(total / 10).toLocaleString(), icon: '📐' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '1.25rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* SVG 바 차트 */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, margin: 0 }}>도메인별 스킬 수</h3>
          <button
            onClick={handleExport}
            style={{
              padding: '0.4rem 1rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            ↓ SVG 내보내기
          </button>
        </div>

        <svg
          id="domain-bar-svg"
          width={SVG_W}
          height={SVG_H}
          style={{ display: 'block', maxWidth: '100%' }}
        >
          {sorted.map((domain, idx) => {
            const y = idx * (BAR_HEIGHT + GAP) + 10;
            const barW = Math.max(4, (domain.skillCount / maxCount) * BAR_MAX_W);
            const pct = ((domain.skillCount / total) * 100).toFixed(1);
            const isHov = hovered === domain.key;

            return (
              <g
                key={domain.key}
                onMouseEnter={() => setHovered(domain.key)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'default' }}
              >
                {/* 도메인 레이블 */}
                <text
                  x={LABEL_W - 8}
                  y={y + BAR_HEIGHT / 2 + 5}
                  textAnchor="end"
                  fontSize={13}
                  fill={isHov ? domain.color : '#aaa'}
                  fontWeight={isHov ? 700 : 400}
                >
                  {domain.icon} {domain.name}
                </text>

                {/* 배경 트랙 */}
                <rect
                  x={LABEL_W}
                  y={y}
                  width={BAR_MAX_W}
                  height={BAR_HEIGHT}
                  rx={6}
                  fill="#2a2a3e"
                />

                {/* 바 */}
                <rect
                  x={LABEL_W}
                  y={y}
                  width={barW}
                  height={BAR_HEIGHT}
                  rx={6}
                  fill={domain.color}
                  opacity={isHov ? 1 : 0.8}
                />

                {/* 퍼센트 (바 내부 - 길이가 충분할 때만) */}
                {barW > 60 && (
                  <text
                    x={LABEL_W + barW - 8}
                    y={y + BAR_HEIGHT / 2 + 5}
                    textAnchor="end"
                    fontSize={11}
                    fill="white"
                    fontWeight={600}
                  >
                    {pct}%
                  </text>
                )}

                {/* 숫자 값 */}
                <text
                  x={LABEL_W + BAR_MAX_W + 10}
                  y={y + BAR_HEIGHT / 2 + 5}
                  textAnchor="start"
                  fontSize={13}
                  fill={isHov ? domain.color : '#aaa'}
                  fontWeight={isHov ? 700 : 400}
                >
                  {domain.skillCount.toLocaleString()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 범례 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {sorted.map(d => (
          <span
            key={d.key}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              background: d.color + '22',
              color: d.color,
              border: `1px solid ${d.color}44`,
              fontWeight: 500,
            }}
          >
            {d.icon} {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────

export default function VisualizationPage() {
  const [activeTab, setActiveTab] = useState<TabId>('distribution');

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          스킬 온톨로지 시각화
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          로봇-스마트팩토리 도메인의 스킬 구조와 관계를 탐색하세요
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        background: 'var(--bg-card)',
        padding: '0.4rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 700 : 400,
              fontSize: '0.95rem',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
                : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'distribution' && <DomainBarChart />}

      {activeTab === 'relations' && (
        <div>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>📖 읽는 법</strong>{' '}
            실선(→)은 스킬·데이터 흐름, 점선(-.→)은 안전 규격 적용 관계입니다.
            AI &amp; ML이 중심 허브 역할을 하며 Perception → AI → Action 계층 구조를 가집니다.
          </div>
          <MermaidChart chart={DOMAIN_RELATION_CHART} id="domain-relations" />
        </div>
      )}

      {activeTab === 'ontology' && (
        <div>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>🌳 온톨로지 4계층</strong>{' '}
            인지(감각) → 추론(두뇌) → 실행(손발) → 인프라(뼈대) 계층으로 스마트팩토리 AX 스킬 체계를 구성합니다.
          </div>
          <MermaidChart chart={ONTOLOGY_CHART} id="skill-ontology" />
        </div>
      )}
    </div>
  );
}
