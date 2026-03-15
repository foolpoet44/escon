/**
 * AI 스킬 매칭 페이지
 *
 * MiroFish BM 적용:
 * - 기존: 단일 폼 → 전체 결과 덤프
 * - 변경: 5단계 Step 플로우 (StepIndicator + 단계별 컴포넌트)
 */

import SkillDiagnosisFlow from '../components/SkillDiagnosisFlow';

export const metadata = {
  title: 'AI 스킬 매칭 | ESCO Skills',
  description: 'AI가 직무 설명을 분석하여 스킬 갭과 학습 로드맵을 제시합니다',
};

export default function AIMatchPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* 페이지 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          AI 스킬 매칭
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
          직무를 입력하면 AI가 스킬 갭을 분석하고 12개월 학습 로드맵을 제시합니다
        </p>
      </div>

      {/* 5단계 진단 플로우 */}
      <SkillDiagnosisFlow />
    </div>
  );
}
