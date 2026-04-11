require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');

async function testSupabase() {
    console.log('--- 1. Supabase 연결 테스트 시작 ---');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('❌ Supabase URL 또는 Key가 .env.local에 정의되지 않았습니다.');
        return false;
    }

    const supabase = createClient(url, key);
    
    try {
        // organizations 테이블에서 1건 조회
        const { data, error } = await supabase.from('organizations').select('*').limit(1);
        
        if (error) {
            console.error('❌ Supabase 조회 오류:', error.message);
            return false;
        }
        
        console.log('✅ Supabase 연결 성공! (조회된 데이터 수:', data.length, ')');
        return true;
    } catch (err) {
        console.error('❌ Supabase 연결 중 예외 발생:', err.message);
        return false;
    }
}

async function testLLM() {
    console.log('\n--- 2. LLM (Gemini) API 테스트 시작 ---');
    const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY;
    const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash';

    if (!apiKey) {
        console.error('❌ LLM_API_KEY (또는 GEMINI_API_KEY)가 .env.local에 정의되지 않았습니다.');
        return false;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        console.log(`🤖 모델(${modelName}) 호출 중...`);
        const result = await ai.models.generateContent({
            model: modelName,
            contents: "Hello! Please reply with 'Testing successful!' if you can read this.",
            config: {
                temperature: 0.1,
                maxOutputTokens: 100
            }
        });

        const text = result.text || '';
        console.log('🤖 LLM 응답:', text);
        
        if (text.includes('Testing successful') || text.length > 0) {
            console.log('✅ LLM API 연결 성공!');
            return true;
        } else {
            console.warn('⚠️ 응답은 왔으나 내용이 비어있습니다.');
            return false;
        }
    } catch (err) {
        console.error('❌ LLM API 연결 중 예외 발생:', err.message);
        return false;
    }
}

async function runAllTests() {
    const supabaseOk = await testSupabase();
    const llmOk = await testLLM();

    console.log('\n==============================');
    if (supabaseOk && llmOk) {
        console.log('🎉 모든 테스트 통과! ESCON 프로젝트가 엔진을 켰습니다.');
    } else {
        console.log('⚠️ 일부 테스트가 실패했습니다. .env.local 설정을 다시 확인해 주세요.');
    }
    console.log('==============================');
}

runAllTests();
