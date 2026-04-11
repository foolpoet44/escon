require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function seedFinal() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(url, key);

    console.log('🚀 [1/4] 데이터 정합성 확보를 위한 핵심 조직 생성...');
    const { data: org } = await supabase.from('organizations').upsert({ name: 'ESCON Global', code: 'escon_global' }).select().single();
    
    console.log('🚀 [2/4] 핵심 에이블러(역할) 생성...');
    const { data: enabler } = await supabase.from('enablers').upsert({ 
        organization_id: org.id, 
        name: '시니어 풀스택 엔지니어', 
        code: 'senior_fullstack' 
    }).select().single();

    console.log('🚀 [3/4] 실전 역량(Skills) 데이터 주입...');
    const coreSkills = [
        { label: 'React', korean_label: '리액트 프론트엔드', type: 'skill/competence', uri: 'esco:react' },
        { label: 'TypeScript', korean_label: '타입스크립트', type: 'knowledge', uri: 'esco:ts' },
        { label: 'Node.js', korean_label: '노드 서버 개발', type: 'skill/competence', uri: 'esco:node' }
    ];
    const { data: skills } = await supabase.from('skills').upsert(coreSkills).select();

    console.log('🚀 [4/4] 역량-역할 관계(Relations) 생성 (사용자 맥락 데이터 대용)...');
    const relations = skills.map((s, idx) => ({
        skill_id: s.id,
        enabler_id: enabler.id,
        organization_id: org.id,
        proficiency: `Level ${3 - (idx % 2)}`, // Level 3, Level 2 반복
        importance: 4
    }));

    const { error: relError } = await supabase.from('skill_enabler_relations').upsert(relations);

    if (relError) {
        console.error('❌ 최종 주입 실패:', relError.message);
    } else {
        console.log('\n✨ ESCON 엔진 가동 준비 완료! ✨');
        console.log('이제 채팅 코치가 별도의 테이블 없이도 당신의 스킬 프로필을 읽어올 수 있습니다.');
    }
}

seedFinal();
