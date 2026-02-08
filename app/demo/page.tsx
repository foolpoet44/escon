"use client";

import { useState } from 'react';
import EnablerCard from '../components/EnablerCard';
import OrgSkillCard from '../components/OrgSkillCard';
import EnablerFilter from '../components/EnablerFilter';
import OrgExportButton from '../components/OrgExportButton';
import type { Enabler } from '../components/EnablerCard';
import type { EnrichedSkill } from '../components/OrgSkillCard';

// 샘플 데이터
const sampleEnablers: Enabler[] = [
  {
    id: 'enabler_1',
    name: 'Flex RPS 기반 모듈화 구조',
    name_en: 'Flex RPS Modular Architecture',
    description: 'Plug & Play형 Flex RPS, Low Code 기반 로봇 시퀀스 프로그래밍',
    priority: 1,
    skillCount: 15,
    expertSkillCount: 5,
    color: '#FF6B6B',
  },
  {
    id: 'enabler_2',
    name: '로봇 솔루션 표준 패키지화',
    name_en: 'Robot Solution Standardization',
    description: '로봇·주변장치·툴링의 표준 셋 제공, One-click Calibration',
    priority: 2,
    skillCount: 19,
    expertSkillCount: 5,
    color: '#FFA500',
  },
  {
    id: 'enabler_3',
    name: 'IRIS 기반 AI 기술 적용',
    name_en: 'IRIS-based AI Technology',
    description: '라인 이벤트 실시간 모니터링, 원격 자동 대응',
    priority: 3,
    skillCount: 24,
    expertSkillCount: 4,
    color: '#4ECDC4',
  },
];

const sampleSkills: EnrichedSkill[] = [
  {
    uri: 'http://data.europa.eu/esco/skill/e87ec79a-c9ff-46f5-84fa-7a0f394cdf40',
    label: 'work with ROS',
    type: 'knowledge',
    description: 'Robot Operating System (ROS) is a middleware framework for robot software development.',
    org_context: {
      organization: '로봇솔루션 Task',
      enabler: 'Enabler 1',
      importance: 5,
      target_proficiency: 'Expert',
      priority_rank: 1,
      korean_label: 'ROS/ROS2',
      notes: '로봇 미들웨어 필수 스킬',
    },
    match_type: 'exact',
  },
  {
    uri: 'http://data.europa.eu/esco/skill/custom-microservices',
    label: 'design microservices architecture',
    type: 'skill/competence',
    description: 'Design and implement microservices-based software architecture.',
    org_context: {
      organization: '로봇솔루션 Task',
      enabler: 'Enabler 1',
      importance: 5,
      target_proficiency: 'Expert',
      priority_rank: 2,
      korean_label: '마이크로서비스 아키텍처 설계',
    },
    match_type: 'exact',
  },
  {
    uri: 'custom:plug-and-play',
    label: 'plug-and-play implementation',
    type: 'skill/competence',
    description: 'Implement plug-and-play functionality for robotic systems.',
    org_context: {
      organization: '로봇솔루션 Task',
      enabler: 'Enabler 1',
      importance: 5,
      target_proficiency: 'Expert',
      priority_rank: 9,
      korean_label: 'Plug & Play 구현 기술',
      notes: '로봇 도메인 특화 스킬',
    },
    match_type: 'custom',
  },
  {
    uri: 'http://data.europa.eu/esco/skill/7b0d5000-00da-4864-b776-6de49a87a669',
    label: 'computer vision',
    type: 'knowledge',
    description: 'Computer vision tools to extract information from digital images.',
    org_context: {
      organization: '로봇솔루션 Task',
      enabler: 'Enabler 2',
      importance: 5,
      target_proficiency: 'Expert',
      priority_rank: 8,
      korean_label: '2D/3D 비전 시스템',
    },
    match_type: 'exact',
  },
  {
    uri: 'http://data.europa.eu/esco/skill/anomaly-detection',
    label: 'anomaly detection',
    type: 'skill/competence',
    description: 'Detect anomalies and outliers in data for quality control.',
    org_context: {
      organization: '로봇솔루션 Task',
      enabler: 'Enabler 3',
      importance: 5,
      target_proficiency: 'Expert',
      priority_rank: 5,
      korean_label: '이상 탐지 알고리즘',
    },
    match_type: 'exact',
  },
  {
    uri: 'http://data.europa.eu/esco/skill/hand-eye-calibration',
    label: 'robot calibration',
    type: 'skill/competence',
    description: 'Calibrate robotic systems for accurate positioning.',
    org_context: {
      organization: '로봇솔루션 Task',
      enabler: 'Enabler 2',
      importance: 5,
      target_proficiency: 'Expert',
      priority_rank: 3,
      korean_label: 'Hand-Eye Calibration',
      notes: 'ESCO에는 robot calibration으로 매핑',
    },
    match_type: 'approximate',
  },
];

export default function ComponentsDemo() {
  const [selectedEnablers, setSelectedEnablers] = useState<string[]>(
    sampleEnablers.map(e => e.id)
  );

  const filteredSkills = sampleSkills.filter(skill => {
    if (selectedEnablers.length === 0) return true;
    const enablerId = skill.org_context?.enabler.toLowerCase().replace(' ', '_');
    return selectedEnablers.includes(enablerId || '');
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '2px solid var(--border-color)' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            🎨 컴포넌트 프로토타입 데모
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            로봇솔루션 Task 조직 스킬 매칭 시스템 - ESCO 통합 컴포넌트
          </p>
        </header>

        {/* Section 1: Enabler Cards */}
        <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              1️⃣ EnablerCard 컴포넌트
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Enabler를 표시하는 카드 컴포넌트 (Priority 배지, 스킬 수 통계)
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {sampleEnablers.map(enabler => (
              <EnablerCard
                key={enabler.id}
                enabler={enabler}
                organizationId="robot-solution"
              />
            ))}
          </div>
        </section>

        {/* Section 2: Enabler Filter */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              2️⃣ EnablerFilter 컴포넌트
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Enabler별 필터링 (전체 선택/해제, 개별 토글)
            </p>
          </div>

          <EnablerFilter
            enablers={sampleEnablers}
            selectedEnablers={selectedEnablers}
            onFilterChange={setSelectedEnablers}
          />
        </section>

        {/* Section 3: Org Skill Cards */}
        <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1 1 auto' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                3️⃣ OrgSkillCard 컴포넌트
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                ESCO 기반 조직 스킬 카드 (중요도, 매칭 타입, 한글/영문, ESCO URI)
                {selectedEnablers.length > 0 && (
                  <span style={{ color: '#4ECDC4', fontWeight: 600 }}>
                    {' '}· 현재 {filteredSkills.length}개 스킬 표시 중
                  </span>
                )}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <OrgExportButton
                data={filteredSkills}
                dataType="skills"
                label="스킬 내보내기"
                filename="demo_skills.csv"
                variant="secondary"
              />
              <OrgExportButton
                data={sampleEnablers}
                dataType="enablers"
                label="Enabler 내보내기"
                filename="demo_enablers.csv"
                variant="secondary"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {filteredSkills.map((skill, idx) => (
              <OrgSkillCard
                key={idx}
                skill={skill}
                showOrgContext={true}
              />
            ))}
          </div>

          {filteredSkills.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <p>선택된 Enabler에 해당하는 스킬이 없습니다.</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                위의 필터에서 Enabler를 선택해주세요.
              </p>
            </div>
          )}
        </section>

        {/* Section 4: Features */}
        <section style={{ marginBottom: '3rem', padding: '2rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>✨ 주요 기능</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '🎯', title: 'Priority 기반 색상', desc: 'Enabler의 우선순위에 따라 자동으로 색상 적용' },
              { icon: '⭐', title: '중요도 시각화', desc: '1-5 별표로 스킬 중요도 직관적 표시' },
              { icon: '🔗', title: 'ESCO URI 연결', desc: 'ESCO 공식 스킬 페이지로 바로 이동' },
              { icon: '🌐', title: '이중 언어 지원', desc: '한글/영문 스킬명 병기' },
              { icon: '✅', title: '매칭 타입 표시', desc: 'Exact/Approximate/Custom 구분' },
              { icon: '🎨', title: '반응형 디자인', desc: '모바일/태블릿/데스크톱 최적화' },
              { icon: '📥', title: '데이터 내보내기', desc: 'CSV/JSON 형식으로 데이터 다운로드' },
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
