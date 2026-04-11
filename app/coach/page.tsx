import CoachingDashboard from './CoachingDashboard'
import { supabase } from '../lib/supabase'

export const metadata = {
  title: 'AI 스킬 코칭 및 갭 분석 | ESCON',
  description: 'AI가 직무 목표를 분석하여 최우선 학습 스킬과 갭을 코칭합니다.',
}

export default async function CoachPage() {
  // DB에서 서버사이드로 목표 역할(Enabler) 목록 가져오기
  const { data: enablers } = await supabase
    .from('enablers')
    .select('id, name, code')
    .order('name')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
            Step 3 Integration
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            ESCON 1:1 역량 코칭 데스크
          </h1>
        </div>
        <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.6 }}>
          목표하는 역할을 선택하면, 뒤에 탑재된 Gap Heuristics 엔진이 귀하의 스킬 갭을 분석하여 최적의 성장 경로를 코칭합니다.
        </p>
      </div>

      <CoachingDashboard enablers={enablers || []} />
    </div>
  )
}
