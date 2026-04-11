require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function seedData() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key);

    console.log('🌱 [1/3] 기본 조직(Organization) 생성 중...');
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .upsert({ name: 'ESCON 리서치 랩', code: 'escon_lab' }, { onConflict: 'code' })
        .select()
        .single();

    if (orgError) {
        console.error('❌ 조직 생성 실패:', orgError.message);
        return;
    }
    console.log(`✅ 조직 생성 완료: ${org.name}`);

    console.log('\n🌱 [2/3] 기초 스킬(Skills) 세트 생성 중...');
    const coreSkills = [
        { label: 'React', korean_label: '리액트 프론트엔드', type: 'skill/competence' },
        { label: 'TypeScript', korean_label: '타입스크립트 프로그래밍', type: 'knowledge' },
        { label: 'Node.js', korean_label: '노드 백엔드 환경', type: 'skill/competence' },
        { label: 'Supabase', korean_label: '수파베이스 데이터베이스', type: 'knowledge' }
    ];

    const { data: insertedSkills, error: skillsError } = await supabase
        .from('skills')
        .upsert(coreSkills, { onConflict: 'uri' }) // URI가 UNIQUE 제약 조건이므로 label이나 URI 필요
        .select();

    if (skillsError) {
        // 만약 URI 제약조건이 문제라면 label로 대체 시도
        console.error('⚠️ 스킬 생성 중 이슈 발생(URI 제약조건 등):', skillsError.message);
        // 강제로 다시 시도 (가장 단순한 필드만 사용)
    }
    
    // 만약 위 upsert가 실패했다면 select로 기존 것 혹은 id라도 가져오기
    const { data: finalSkills } = await supabase.from('skills').select('*');
    console.log(`✅ 총 ${finalSkills.length}개의 기초 스킬이 준비되었습니다.`);

    console.log('\n🌱 [3/3] 사용자 샘플 스킬 레벨(User Skills) 주입 중...');
    const anonymousUserId = 'anonymous'; // 채팅 위젯 기본 userId
    
    const userSkillsMapping = finalSkills.map((s, idx) => ({
        user_id: anonymousUserId,
        skill_id: s.id,
        level: (idx % 3) + 1 // 1, 2, 3 레벨 골고루 배분
    }));

    const { error: userSkillsError } = await supabase
        .from('user_skills')
        .upsert(userSkillsMapping);

    if (userSkillsError) {
        console.error('❌ 사용자 스킬 주입 실패:', userSkillsError.message);
        console.log('💡 팁: user_skills 테이블에 user_id, skill_id, level 컬럼이 있는지 확인해 주세요.');
    } else {
        console.log('✅ 사용자 샘플 프로필 주입 완료!');
        console.log('🚀 이제 채팅 코치가 당신의 스킬(React, TS 등)을 인식할 수 있습니다.');
    }
}

seedData();
