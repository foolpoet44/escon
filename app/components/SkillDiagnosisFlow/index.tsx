'use client';

/**
 * SkillDiagnosisFlow - 5단계 스킬 진단 플로우
 *
 * MiroFish BM 적용 (단기):
 * Step1 → Step2 → Step3(AI 분석) → Step4(갭 결과) → Step5(로드맵)
 *
 * 각 Step 컴포넌트는 독립적이며, 이 index.tsx가 상태와 전환을 담당한다.
 * 마치 오케스트라 지휘자처럼 - 악기(컴포넌트)는 제 역할만 하고,
 * 지휘자(index)가 순서와 흐름을 제어한다.
 */

import { useState } from 'react';
import StepIndicator from './StepIndicator';
import Step1JobInput from './Step1JobInput';
import Step2SkillCheckup from './Step2SkillCheckup';
import Step3Analyzing from './Step3Analyzing';
import Step4GapResult from './Step4GapResult';
import Step5Roadmap from './Step5Roadmap';

interface AIAnalysisResult {
  recommendedSkills: {
    skillName: string;
    escoCode?: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  skillGap: {
    skillName: string;
    importance: string;
    learningResources: string[];
  }[];
  careerPath: {
    shortTerm: string[];
    midTerm: string[];
    longTerm: string[];
  };
}

export default function SkillDiagnosisFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobDescription, setJobDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 3 진입 시 자동으로 AI 분석 호출
  const startAnalysis = async () => {
    setCurrentStep(3);
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/match-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          currentSkills: selectedSkills,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '분석 요청 실패');
      }

      const data = await response.json();
      setAnalysisResult(data.data);
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const restart = () => {
    setCurrentStep(1);
    setJobDescription('');
    setSelectedSkills([]);
    setAnalysisResult(null);
    setError(null);
  };

  const cardStyle = {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '2rem',
    border: '1px solid var(--border-color)',
    maxWidth: '720px',
    margin: '0 auto',
  };

  return (
    <div>
      {/* 상단 진행 표시 */}
      <StepIndicator currentStep={currentStep} />

      {/* 단계별 컨텐츠 */}
      <div style={cardStyle}>
        {currentStep === 1 && (
          <Step1JobInput
            jobDescription={jobDescription}
            onChange={setJobDescription}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <Step2SkillCheckup
            selectedSkills={selectedSkills}
            onChange={setSelectedSkills}
            onNext={startAnalysis}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Analyzing
            isAnalyzing={isAnalyzing}
            error={error}
            onRetry={startAnalysis}
          />
        )}

        {currentStep === 4 && analysisResult && (
          <Step4GapResult
            recommendedSkills={analysisResult.recommendedSkills}
            skillGap={analysisResult.skillGap}
            onNext={() => setCurrentStep(5)}
            onRestart={restart}
          />
        )}

        {currentStep === 5 && analysisResult && (
          <Step5Roadmap
            careerPath={analysisResult.careerPath}
            jobDescription={jobDescription}
            selectedSkills={selectedSkills}
            onRestart={restart}
          />
        )}
      </div>
    </div>
  );
}
