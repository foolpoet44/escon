require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkInfrastructure() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key);

    console.log('🔍 [점검 1] user_skills 테이블 존재 여부 확인...');
    const { error: userSkillsError } = await supabase.from('user_skills').select('count', { count: 'exact', head: true });
    
    if (userSkillsError && userSkillsError.code === 'PGRST116') {
        console.log('❌ user_skills 테이블이 없습니다. 생성이 필요합니다.');
    } else if (userSkillsError) {
        console.log('⚠️ 기타 오류 발생:', userSkillsError.message);
    } else {
        console.log('✅ user_skills 테이블이 존재합니다.');
    }

    console.log('\n🔍 [점검 2] 기초 데이터(skills) 존재 여부 확인...');
    const { data: skills, error: skillsError } = await supabase.from('skills').select('id, label').limit(5);
    
    if (skillsError) {
        console.log('❌ skills 테이블 조회 실패:', skillsError.message);
    } else {
        console.log(`✅ skills 테이블에 ${skills.length}개의 데이터가 있습니다.`);
        if (skills.length > 0) {
            console.log('   샘플:', skills.map(s => s.label).join(', '));
        }
    }
}

checkInfrastructure();
