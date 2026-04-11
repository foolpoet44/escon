require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function seedUserSkills() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key);

    console.log('🔍 skills 테이블 데이터 확인...');
    const { data: skills, error: skillsError } = await supabase.from('skills').select('*');
    
    if (skillsError || !skills || skills.length === 0) {
        console.error('❌ 스킬 기준 데이터가 부족합니다.');
        return;
    }

    console.log(`✅ ${skills.length}개의 스킬 확보. 'anonymous' 유저 프로필 생성 시작...`);
    
    // React는 레벨 1 (초보), TS는 레벨 2 (적용), Node는 안 넣거나 레벨 1.
    // 시니어 목표가 보통 3~4이므로, 갭을 크게 발생시키기 위해 의도적으로 낮게 잡습니다.
    const userSkillsData = skills.map((s, idx) => ({
        user_id: 'anonymous',
        skill_id: s.id,
        level: (idx % 2) + 1 // 1 또는 2
    }));

    const { error: upsertError } = await supabase
        .from('user_skills')
        .upsert(userSkillsData, { onConflict: 'user_id, skill_id' }); 
        // 테이블 스키마에 UNIQUE(user_id, skill_id)가 있어야 onConflict가 동작합니다.
        // 에러나면 그냥 catch하고 무시 (이미 들어간 것에 대해서)

    if (upsertError) {
        console.log('⚠️ UPSERT 오류(고유키 제약조건 등) 발생:', upsertError.message);
        // 고유키 조건이 매칭안되면 수동으로 지우고 다시 넣기 시도
        await supabase.from('user_skills').delete().eq('user_id', 'anonymous');
        await supabase.from('user_skills').insert(userSkillsData);
        console.log('✅ 데이터 덮어쓰기 완료');
    } else {
         console.log('✅ 사용자 프로필 주입 완료');
    }
}

seedUserSkills();
