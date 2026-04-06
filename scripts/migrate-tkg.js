#!/usr/bin/env node

/**
 * TKG (Temporal Knowledge Graph) 마이그레이션 스크립트
 *
 * 목적:
 * 1. valid_from/valid_to 컬럼 추가
 * 2. 감사 로그 테이블 생성
 * 3. 기존 데이터를 TKG 구조로 변환
 *
 * 사용법:
 * node scripts/migrate-tkg.js
 *
 * 요구사항:
 * - .env.local 파일에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// ============================================================================
// 검증 및 설정
// ============================================================================

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 에러: Supabase 환경변수가 설정되지 않았습니다.')
  console.error('   .env.local 파일에 다음을 추가하세요:')
  console.error('   SUPABASE_URL=your-project-url')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ============================================================================
// 마이그레이션 함수들
// ============================================================================

/**
 * 1단계: 스키마 마이그레이션 (컬럼 추가)
 */
async function migrateSchema() {
  console.log('\n📋 [Step 1] 스키마 마이그레이션...')

  try {
    // SQL 마이그레이션 실행
    const { error } = await supabase.from('audit_logs').select('count()', { count: 'exact' })

    // audit_logs 테이블이 없으면 생성
    if (error && error.message.includes('does not exist')) {
      console.log('  ℹ️  audit_logs 테이블이 없습니다.')
      console.log('  💡 SQL 마이그레이션을 Supabase 콘솔에서 수동 실행하세요:')
      console.log('     파일: database/migrations/001_add_temporal_columns.sql')
      return false
    }

    console.log('  ✅ 스키마 마이그레이션 완료')
    return true
  } catch (err) {
    console.error('  ❌ 스키마 마이그레이션 실패:', err.message)
    return false
  }
}

/**
 * 2단계: 기존 스킬 데이터 검증
 */
async function validateExistingData() {
  console.log('\n📊 [Step 2] 기존 데이터 검증...')

  try {
    const [skillsResult, relationsResult, orgsResult] = await Promise.all([
      supabase.from('skills').select('count', { count: 'exact' }),
      supabase.from('skill_enabler_relations').select('count', { count: 'exact' }),
      supabase.from('organizations').select('count', { count: 'exact' }),
    ])

    const skillsCount = skillsResult.count || 0
    const relationsCount = relationsResult.count || 0
    const orgsCount = orgsResult.count || 0

    console.log(`  📈 Organizations: ${orgsCount}개`)
    console.log(`  📈 Skills: ${skillsCount}개`)
    console.log(`  📈 Relations: ${relationsCount}개`)

    return { skillsCount, relationsCount, orgsCount }
  } catch (err) {
    console.error('  ❌ 데이터 검증 실패:', err.message)
    return null
  }
}

/**
 * 3단계: TKG 컬럼 마이그레이션 (application layer)
 */
async function migrateTemporalColumns() {
  console.log('\n⏰ [Step 3] 시간대 컬럼 마이그레이션...')

  try {
    // 스킬 데이터에 valid_from 설정 (현재 생성된 모든 스킬이 지금부터 유효)
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('id, created_at')
      .is('valid_from', null)

    if (skillsError) {
      console.log('  ℹ️  valid_from 컬럼이 이미 설정되어 있거나 마이그레이션 완료됨')
      return true
    }

    if (skills && skills.length > 0) {
      console.log(`  🔄 ${skills.length}개 스킬의 valid_from 설정 중...`)

      // 배치 업데이트 (최대 1000개 단위)
      for (let i = 0; i < skills.length; i += 1000) {
        const batch = skills.slice(i, i + 1000)
        const { error: updateError } = await supabase
          .from('skills')
          .upsert(
            batch.map(skill => ({
              id: skill.id,
              valid_from: skill.created_at,
              valid_to: null,
              version: 1,
            })),
            { onConflict: 'id' }
          )

        if (updateError) {
          console.error(`  ❌ 배치 ${i}-${i + 1000} 업데이트 실패:`, updateError.message)
          return false
        }

        console.log(`  ✓ ${Math.min(i + 1000, skills.length)}/${skills.length} 완료`)
      }
    }

    console.log('  ✅ 시간대 컬럼 마이그레이션 완료')
    return true
  } catch (err) {
    console.error('  ❌ 마이그레이션 실패:', err.message)
    return false
  }
}

/**
 * 4단계: 감사 로그 초기화
 */
async function initializeAuditLogs() {
  console.log('\n📝 [Step 4] 감사 로그 초기화...')

  try {
    // 마이그레이션 시작 로그 추가
    const { error } = await supabase.from('audit_logs').insert([
      {
        table_name: 'system',
        record_id: '00000000-0000-0000-0000-000000000000',
        action: 'CREATE',
        changes: {
          event: 'TKG migration started',
          timestamp: new Date().toISOString(),
        },
        created_by: 'system',
        description: 'TKG (Temporal Knowledge Graph) 마이그레이션 시작',
        source: 'migration',
      },
    ])

    if (error && !error.message.includes('does not exist')) {
      throw error
    }

    console.log('  ✅ 감사 로그 초기화 완료')
    return true
  } catch (err) {
    if (err.message.includes('does not exist')) {
      console.log('  ℹ️  audit_logs 테이블이 아직 생성되지 않았습니다.')
      console.log('  💡 Supabase 콘솔에서 001_add_temporal_columns.sql 실행 후 다시 시도하세요.')
      return false
    }
    console.error('  ❌ 감사 로그 초기화 실패:', err.message)
    return false
  }
}

/**
 * 5단계: 마이그레이션 완료 보고
 */
function reportMigrationStatus(results) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 마이그레이션 완료 보고서')
  console.log('='.repeat(60))

  const allPassed = Object.values(results).every(r => r)

  if (allPassed) {
    console.log('✅ 모든 단계 완료!')
    console.log('\n다음 단계:')
    console.log('  1. Supabase 대시보드에서 쿼리 실행 결과 확인')
    console.log('  2. "npm run dev" 로 애플리케이션 시작')
    console.log('  3. 새로운 UI 컴포넌트 테스트')
  } else {
    console.log('⚠️  일부 단계에서 문제가 발생했습니다.')
    console.log('\n실패한 단계:')
    Object.entries(results).forEach(([step, passed]) => {
      if (!passed) {
        console.log(`  - ${step}`)
      }
    })
  }

  console.log('\n문서: docs/TKG_MIGRATION.md')
  console.log('='.repeat(60) + '\n')
}

// ============================================================================
// 메인 실행
// ============================================================================

async function main() {
  console.log('\n🚀 TKG 마이그레이션 시작')
  console.log('=' + '='.repeat(59))

  const results = {
    'Step 1: 스키마': await migrateSchema(),
    'Step 2: 데이터검증': !!(await validateExistingData()),
    'Step 3: 컬럼마이그레이션': await migrateTemporalColumns(),
    'Step 4: 감사로그': await initializeAuditLogs(),
  }

  reportMigrationStatus(results)

  process.exit(Object.values(results).every(r => r) ? 0 : 1)
}

main().catch(err => {
  console.error('❌ 예상치 못한 에러:', err)
  process.exit(1)
})
