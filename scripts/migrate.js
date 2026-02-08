const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local');
    console.error('Please configure your .env.local file with Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    try {
        console.log('Starting migration...');

        // 1. Load Base Skills (for metadata lookup)
        const skillsJsonPath = path.join(__dirname, '../public/data/skills.json');
        let baseSkills = [];
        const skillsMap = new Map();

        if (fs.existsSync(skillsJsonPath)) {
            baseSkills = JSON.parse(fs.readFileSync(skillsJsonPath, 'utf8'));
            baseSkills.forEach(s => {
                if (s.uri) skillsMap.set(s.uri, s);
            });
            console.log(`Loaded ${baseSkills.length} base skills for metadata lookup.`);
        } else {
            console.warn('Warning: skills.json not found. Metadata enrichment will be limited.');
        }

        // 2. Load Organization Data
        const orgJsonPath = path.join(__dirname, '../public/data/organizations/robot-solution.json');
        if (!fs.existsSync(orgJsonPath)) {
            throw new Error(`Organization file not found: ${orgJsonPath}`);
        }
        const orgData = JSON.parse(fs.readFileSync(orgJsonPath, 'utf8'));
        console.log(`Loaded organization: ${orgData.name}`);

        // 3. Upsert Organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .upsert({
                code: 'robot_solution',
                name: orgData.name,
                description: orgData.description || ''
            }, { onConflict: 'code' })
            .select()
            .single();

        if (orgError) throw orgError;
        console.log(`Upserted Organization: ${org.name} (${org.id})`);

        // 4. Process Enablers
        for (const enabler of orgData.enablers) {
            // 4.1 Upsert Enabler
            const { data: enablerRecord, error: enablerError } = await supabase
                .from('enablers')
                .upsert({
                    organization_id: org.id,
                    code: enabler.id,
                    name: enabler.name,
                    priority: enabler.priority,
                    description: enabler.description || '',
                    metadata: enabler.metadata || {}
                }, { onConflict: 'organization_id, code' })
                .select()
                .single();

            if (enablerError) throw enablerError;
            console.log(`  Upserted Enabler: ${enablerRecord.name}`);

            // 4.2 Process Skills
            if (enabler.skills && Array.isArray(enabler.skills)) {
                console.log(`    Processing ${enabler.skills.length} skills...`);

                for (const skillLink of enabler.skills) {
                    const uri = skillLink.esco_uri;
                    const baseSkill = skillsMap.get(uri) || {};

                    const skillPayload = {
                        label: baseSkill.label || skillLink.name || 'Unknown Skill',
                        english_label: baseSkill.englishLabel || skillLink.englishLabel || '',
                        korean_label: baseSkill.koreanLabel || skillLink.koreanLabel || '',
                        type: baseSkill.type || skillLink.type || 'skill/competence',
                        uri: uri || null,
                        description: baseSkill.description || ''
                    };

                    // 4.2.1 Upsert Skill
                    let skillRecord;
                    if (skillPayload.uri) {
                        const { data, error } = await supabase
                            .from('skills')
                            .upsert(skillPayload, { onConflict: 'uri' })
                            .select()
                            .single();

                        if (error) {
                            console.error(`      Failed to upsert skill (URI): ${skillPayload.label}`, error.message);
                            continue;
                        }
                        skillRecord = data;
                    } else {
                        // Fallback: Try to find by label to avoid duplicates
                        const { data: existing } = await supabase
                            .from('skills')
                            .select('id')
                            .eq('label', skillPayload.label)
                            .maybeSingle();

                        if (existing) {
                            skillRecord = existing;
                        } else {
                            const { data, error } = await supabase
                                .from('skills')
                                .insert(skillPayload)
                                .select()
                                .single();

                            if (error) {
                                console.error(`      Failed to insert skill (No URI): ${skillPayload.label}`, error.message);
                                continue;
                            }
                            skillRecord = data;
                        }
                    }

                    // 4.2.2 Create Relation
                    // Note: skillLink might have different properties depending on source
                    const importance = skillLink.importance || 1;
                    const proficiency = skillLink.proficiency || '';
                    const matchType = skillLink.matchType || 'Direct';

                    const { error: relError } = await supabase
                        .from('skill_enabler_relations')
                        .upsert({
                            skill_id: skillRecord.id,
                            enabler_id: enablerRecord.id,
                            organization_id: org.id,
                            importance: importance,
                            proficiency: proficiency,
                            match_type: matchType
                        }, { onConflict: 'skill_id, enabler_id' });

                    if (relError) {
                        console.error(`      Failed to link skill ${skillRecord.label}`, relError.message);
                    }
                }
            }
        }

        console.log('Migration completed successfully!');

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

main();
