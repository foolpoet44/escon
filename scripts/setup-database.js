#!/usr/bin/env node

// ============================================================================
// 데이터베이스 환경 설정 스크립트
//
// 개발, 스테이징, 프로덕션 환경별로 데이터베이스를 설정합니다.
// 환경 변수에 따라 마이그레이션을 자동으로 실행합니다.
//
// 사용법:
//   npm run setup-database        # 인터랙티브 모드
//   npm run setup-database -- production  # 직접 지정
// ============================================================================

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const ENVIRONMENTS = {
  development: {
    description: '개발 환경 (로컬 Supabase)',
    color: '🟦',
  },
  staging: {
    description: '스테이징 환경 (테스트 데이터)',
    color: '🟨',
  },
  production: {
    description: '프로덕션 환경 (실제 데이터)',
    color: '🟥',
  },
};

// ============================================================================
// 마이그레이션 파일 읽기
// ============================================================================
function getMigrations() {
  const migrationsDir = path.join(__dirname, '../database/migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.warn('⚠️  마이그레이션 폴더가 없습니다:', migrationsDir);
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

// ============================================================================
// Supabase 클라이언트 생성
// ============================================================================
function createSupabaseClient(env) {
  const url = env === 'production'
    ? process.env.SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key = env === 'production'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      `❌ 환경 변수가 설정되지 않았습니다: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY`
    );
  }

  return createClient(url, key);
}

// ============================================================================
// 마이그레이션 실행
// ============================================================================
async function runMigrations(env) {
  console.log(`\n${ENVIRONMENTS[env].color} [${env.toUpperCase()}] 환경 설정 시작...\n`);

  try {
    const supabase = createSupabaseClient(env);
    const migrations = getMigrations();

    if (migrations.length === 0) {
      console.log('✅ 실행할 마이그레이션이 없습니다.');
      return;
    }

    console.log(`📋 ${migrations.length}개의 마이그레이션을 실행합니다:\n`);

    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, '../database/migrations', migration);
      const sql = fs.readFileSync(migrationPath, 'utf-8');

      console.log(`  ▶ ${migration}`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
          // 이미 실행된 마이그레이션인 경우 무시
          if (error.message.includes('already exists')) {
            console.log(`    ✅ 이미 실행됨 (무시)`);
          } else {
            throw error;
          }
        } else {
          console.log(`    ✅ 완료`);
        }
      } catch (err) {
        console.error(`    ❌ 실패:`, err.message);

        if (env === 'production') {
          throw err; // 프로덕션은 에러 발생
        }
      }
    }

    console.log(`\n✨ ${env.toUpperCase()} 환경 설정 완료!\n`);
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// 환경 유효성 검사
// ============================================================================
async function validateEnvironment(env) {
  try {
    const supabase = createSupabaseClient(env);
    const { data, error } = await supabase.from('audit_logs').select('count()').limit(1);

    if (error) {
      throw new Error(`데이터베이스 연결 실패: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ 환경 검증 실패: ${error.message}`);
    return false;
  }
}

// ============================================================================
// 메인 함수
// ============================================================================
async function main() {
  const args = process.argv.slice(2);
  let env = args[0];

  if (!env) {
    // 대화형 모드
    console.log('\n🗄️  데이터베이스 환경 설정\n');
    console.log('설정할 환경을 선택하세요:\n');

    Object.entries(ENVIRONMENTS).forEach(([key, value], index) => {
      console.log(`  ${index + 1}. ${value.color} ${key.padEnd(15)} - ${value.description}`);
    });

    console.log('\n');
    const choice = process.argv[2]?.trim();
    env = Object.keys(ENVIRONMENTS)[parseInt(choice) - 1];

    if (!env) {
      console.log('❌ 잘못된 선택입니다.');
      process.exit(1);
    }
  }

  if (!ENVIRONMENTS[env]) {
    console.error(`❌ 알 수 없는 환경: ${env}`);
    process.exit(1);
  }

  // 환경 검증
  const isValid = await validateEnvironment(env);
  if (!isValid) {
    process.exit(1);
  }

  // 마이그레이션 실행
  await runMigrations(env);
}

main().catch((error) => {
  console.error('❌ 예상 외의 오류:', error);
  process.exit(1);
});
