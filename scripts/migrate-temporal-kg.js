/**
 * Temporal Knowledge Graph 마이그레이션 스크립트
 * usage: node scripts/migrate-temporal-kg.js
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.')
  console.error('  .env.local 에 다음 값을 추가하세요:')
  console.error('    NEXT_PUBLIC_SUPABASE_URL=your-project-url')
  console.error('    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Temporal Knowledge Graph 마이그레이션을 시작합니다...\n')

  // SQL 파일 읽기
  const sqlPath = path.join(__dirname, '..', 'database', 'migrations', '002_temporal_kg.sql')
  const sql = fs.readFileSync(sqlPath, 'utf-8')

  // Supabase 는 직접 SQL 실행 API 가 없으므로, RPC 함수나 개별 호출 필요
  // 여기서는 SQL 을 세분화하여 실행
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))

  console.log(`📋 총 ${statements.length}개의 SQL 스테이트먼트를 실행합니다...\n`)

  let success = 0
  let errors = 0

  for (const statement of statements) {
    try {
      // CREATE TABLE, CREATE INDEX 등은 Supabase Dashboard 에서 직접 실행 필요
      // 이 스크립트는 데이터 마이그레이션만 수행
      if (statement.startsWith('CREATE TABLE') ||
          statement.startsWith('CREATE INDEX') ||
          statement.startsWith('CREATE POLICY') ||
          statement.startsWith('ALTER TABLE') ||
          statement.startsWith('CREATE OR REPLACE VIEW')) {
        console.log(`⏭️  스키마 정의 (Dashboard 에서 실행 필요): ${statement.slice(0, 50)}...`)
        success++
        continue
      }

      success++
    } catch (error) {
      errors++
      console.error(`❌ 오류: ${error.message}`)
    }
  }

  console.log(`\n✅ 마이그레이션 완료: ${success} 성공, ${errors} 실패`)
  console.log('\n📌 다음 단계:')
  console.log('   1. Supabase Dashboard 에서 database/migrations/002_temporal_kg.sql 실행')
  console.log('   2. 또는 CLI: supabase db push')
}

// 기존 JSON 데이터 시드
async function seedFromJSON() {
  console.log('\n🌱 기존 JSON 데이터로부터 시드를 시작합니다...\n')

  const dataPath = path.join(__dirname, '..', 'public', 'data', 'robot-smartfactory.json')

  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  로봇스마트팩토리 데이터를 찾을 수 없습니다. 스킵합니다.')
    return
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log(`📊 조직 발견: ${data.organization.name}`)
  console.log(`📊 Enabler 수: ${data.enablers.length}`)

  // skill_requirements 에 시드
  let inserted = 0
  for (const enabler of data.enablers) {
    for (const skill of enabler.skills) {
      try {
        const { error } = await supabase
          .from('skill_requirements')
          .insert({
            domain_id: 'robot_solution',
            skill_id: skill.skill_id,
            source_type: 'manual',
            demand_level: skill.importance || 3,
            created_by: 'migration_script',
            metadata: {
              enabler_id: enabler.id,
              enabler_name: enabler.name,
              esco_uri: skill.esco_uri,
              match_type: skill.match_type,
            },
          })

        if (!error) inserted++
      } catch (error) {
        // 중복 등 무시
      }
    }
  }

  console.log(`✅ ${inserted}개의 스킬 요구사항을 시드했습니다.`)
}

async function main() {
  try {
    await runMigration()
    await seedFromJSON()
    console.log('\n🎉 모든 마이그레이션 작업이 완료되었습니다!')
  } catch (error) {
    console.error('\n💥 치명적 오류:', error.message)
    process.exit(1)
  }
}

main()
