#!/usr/bin/env node

/**
 * 로봇테크 for 스마트팩토리 스킬 데이터 검증 스크립트
 *
 * 검증 항목:
 * 1. 전체 스킬 수 카운트 (목표: 120개 이상)
 * 2. 도메인별 분포 (6개 도메인 모두 존재하는지)
 * 3. skill_type별 분포 (knowledge/skill/competence 비율)
 * 4. role_mapping 커버리지 (3개 역할 모두 커버)
 * 5. 고아 스킬 탐지 (parent_skill_id가 있지만 해당 ID가 없는 경우)
 * 6. related_skills 상호참조 검증
 */

const fs = require('fs');
const path = require('path');

// ==================== 색상 출력 헬퍼 ====================
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(60));
  log(` ${title}`, 'cyan');
  console.log('='.repeat(60));
}

// ==================== 검증 로직 ====================

class RobotDataValidator {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.data = null;
    this.errors = [];
    this.warnings = [];
  }

  load() {
    try {
      const content = fs.readFileSync(this.dataPath, 'utf-8');
      this.data = JSON.parse(content);
      log(`✅ 데이터 로드 성공: ${this.dataPath}`, 'green');
      return true;
    } catch (error) {
      log(`❌ 데이터 로드 실패: ${error.message}`, 'red');
      return false;
    }
  }

  // 1. 전체 스킬 수 검증
  validateTotalSkills() {
    header('1️⃣ 전체 스킬 수 검증');

    const totalSkills = this.data.length;
    const minRequired = 120;

    log(`총 스킬 수: ${totalSkills}개`, totalSkills >= minRequired ? 'green' : 'red');

    if (totalSkills >= minRequired) {
      log(`✅ 목표 달성 (목표: ${minRequired}개 이상)`, 'green');
    } else {
      log(`⚠️ 부족: ${minRequired - totalSkills}개 더 필요`, 'yellow');
      this.warnings.push(`스킬 수 부족: ${totalSkills}/${minRequired}`);
    }

    return totalSkills;
  }

  // 2. 도메인별 분포 검증
  validateDomainDistribution() {
    header('2️⃣ 도메인별 분포 검증');

    const expectedDomains = [
      'industrial-robot-control',
      'machine-vision-sensor',
      'collaborative-robot',
      'autonomous-mobile-robot',
      'robot-maintenance-diagnostics',
      'digital-twin-simulation',
    ];

    const domainStats = {};
    this.data.forEach((skill) => {
      if (!domainStats[skill.domain]) {
        domainStats[skill.domain] = 0;
      }
      domainStats[skill.domain]++;
    });

    const foundDomains = Object.keys(domainStats);
    const missingDomains = expectedDomains.filter((d) => !foundDomains.includes(d));

    // 도메인별 상세 정보
    const table = [];
    expectedDomains.forEach((domain) => {
      const count = domainStats[domain] || 0;
      const status = count > 0 ? '✅' : '❌';
      table.push({
        Domain: status,
        Name: domain,
        Count: count,
      });
    });

    console.table(table);

    if (missingDomains.length === 0) {
      log(`✅ 모든 6개 도메인이 존재합니다.`, 'green');
    } else {
      log(`❌ 누락된 도메인: ${missingDomains.join(', ')}`, 'red');
      this.errors.push(`누락된 도메인: ${missingDomains.join(', ')}`);
    }

    return domainStats;
  }

  // 3. skill_type별 분포 검증
  validateSkillTypeDistribution() {
    header('3️⃣ 스킬 타입별 분포 검증');

    const typeStats = {};
    this.data.forEach((skill) => {
      const type = skill.skill_type;
      if (!typeStats[type]) {
        typeStats[type] = 0;
      }
      typeStats[type]++;
    });

    const total = this.data.length;
    const table = [];

    Object.entries(typeStats).forEach(([type, count]) => {
      const percentage = ((count / total) * 100).toFixed(1);
      table.push({
        Type: type,
        Count: count,
        Percentage: `${percentage}%`,
      });
    });

    console.table(table);

    // 3층 모두 존재하는지 확인
    const expectedTypes = ['knowledge', 'skill', 'competence'];
    const foundTypes = Object.keys(typeStats);
    const allPresent = expectedTypes.every((t) => foundTypes.includes(t));

    if (allPresent) {
      log(`✅ 3층 계층 구조 모두 존재 (Knowledge, Skill, Competence)`, 'green');
    } else {
      const missing = expectedTypes.filter((t) => !foundTypes.includes(t));
      log(`❌ 누락된 스킬 타입: ${missing.join(', ')}`, 'red');
      this.errors.push(`누락된 스킬 타입: ${missing.join(', ')}`);
    }

    return typeStats;
  }

  // 4. role_mapping 커버리지 검증
  validateRoleMapping() {
    header('4️⃣ 역할 커버리지 검증');

    const roleStats = {};
    const expectedRoles = ['operator', 'engineer', 'developer'];

    this.data.forEach((skill) => {
      skill.role_mapping.forEach((role) => {
        if (!roleStats[role]) {
          roleStats[role] = 0;
        }
        roleStats[role]++;
      });
    });

    const table = [];
    expectedRoles.forEach((role) => {
      const count = roleStats[role] || 0;
      const status = count > 0 ? '✅' : '❌';
      table.push({
        Role: status,
        Name: role,
        Count: count,
      });
    });

    console.table(table);

    // 모든 역할이 커버되는지 확인
    const allCovered = expectedRoles.every((r) => roleStats[r] && roleStats[r] > 0);

    if (allCovered) {
      log(`✅ 3개 역할 모두 커버됨`, 'green');
    } else {
      const missing = expectedRoles.filter((r) => !roleStats[r] || roleStats[r] === 0);
      log(`❌ 누락된 역할: ${missing.join(', ')}`, 'red');
      this.errors.push(`누락된 역할: ${missing.join(', ')}`);
    }

    return roleStats;
  }

  // 5. 고아 스킬 탐지
  validateOrphanSkills() {
    header('5️⃣ 고아 스킬 탐지 (parent_skill_id 검증)');

    const skillIds = new Set(this.data.map((s) => s.skill_id));
    const orphans = [];

    this.data.forEach((skill) => {
      if (skill.parent_skill_id && !skillIds.has(skill.parent_skill_id)) {
        orphans.push({
          skill_id: skill.skill_id,
          parent_id: skill.parent_skill_id,
          label: skill.preferred_label_ko,
        });
      }
    });

    if (orphans.length === 0) {
      log(`✅ 고아 스킬 없음 (모든 parent_skill_id가 유효함)`, 'green');
    } else {
      log(`⚠️ 고아 스킬 발견: ${orphans.length}개`, 'yellow');
      console.table(orphans);
      this.warnings.push(`고아 스킬: ${orphans.length}개`);
    }

    return orphans;
  }

  // 6. related_skills 상호참조 검증
  validateRelatedSkills() {
    header('6️⃣ related_skills 상호참조 검증');

    const skillIds = new Set(this.data.map((s) => s.skill_id));
    const invalidReferences = [];

    this.data.forEach((skill) => {
      if (skill.related_skills && Array.isArray(skill.related_skills)) {
        skill.related_skills.forEach((relatedId) => {
          if (!skillIds.has(relatedId)) {
            invalidReferences.push({
              skill_id: skill.skill_id,
              invalid_reference: relatedId,
            });
          }
        });
      }
    });

    if (invalidReferences.length === 0) {
      log(`✅ 모든 related_skills 참조가 유효함`, 'green');
    } else {
      log(`⚠️ 유효하지 않은 참조 발견: ${invalidReferences.length}개`, 'yellow');
      console.table(invalidReferences);
      this.warnings.push(`유효하지 않은 참조: ${invalidReferences.length}개`);
    }

    return invalidReferences;
  }

  // 7. 추가 통계: proficiency_level 분포
  validateProficiencyDistribution() {
    header('7️⃣ 숙련도 레벨 분포 검증');

    const profStats = {};
    this.data.forEach((skill) => {
      const level = skill.proficiency_level;
      if (!profStats[level]) {
        profStats[level] = 0;
      }
      profStats[level]++;
    });

    const table = [];
    for (let level = 1; level <= 4; level++) {
      const count = profStats[level] || 0;
      const percentage = ((count / this.data.length) * 100).toFixed(1);
      table.push({
        Level: level,
        Count: count,
        Percentage: `${percentage}%`,
      });
    }

    console.table(table);

    // 모든 레벨이 표현되는지 확인
    const allLevels = [1, 2, 3, 4].every((l) => profStats[l] && profStats[l] > 0);
    if (allLevels) {
      log(`✅ 4개 레벨 모두 표현됨`, 'green');
    } else {
      log(`⚠️ 누락된 레벨이 있습니다.`, 'yellow');
    }

    return profStats;
  }

  // 8. 필드 완성도 검증
  validateFieldCompleteness() {
    header('8️⃣ 필드 완성도 검증');

    const requiredFields = [
      'skill_id',
      'domain',
      'esco_uri',
      'preferred_label_ko',
      'preferred_label_en',
      'skill_type',
      'proficiency_level',
      'role_mapping',
    ];

    let incompleteCount = 0;

    this.data.forEach((skill) => {
      requiredFields.forEach((field) => {
        if (!skill[field] || skill[field] === '' || (Array.isArray(skill[field]) && skill[field].length === 0)) {
          incompleteCount++;
          this.errors.push(`스킬 ${skill.skill_id}: 필수 필드 '${field}' 누락`);
        }
      });
    });

    if (incompleteCount === 0) {
      log(`✅ 모든 스킬의 필수 필드가 완성됨`, 'green');
    } else {
      log(`❌ 불완전한 필드: ${incompleteCount}개`, 'red');
    }

    return incompleteCount === 0;
  }

  // 최종 리포트
  generateReport() {
    header('📋 최종 검증 리포트');

    console.log('\n');
    if (this.errors.length === 0) {
      log('🎉 검증 완료: 모든 검증에 통과했습니다!', 'green');
    } else {
      log(`❌ 발견된 오류: ${this.errors.length}개`, 'red');
      this.errors.forEach((error) => log(`   - ${error}`, 'red'));
    }

    if (this.warnings.length > 0) {
      log(`\n⚠️ 경고: ${this.warnings.length}개`, 'yellow');
      this.warnings.forEach((warning) => log(`   - ${warning}`, 'yellow'));
    }

    console.log('\n' + '='.repeat(60));
  }

  run() {
    if (!this.load()) {
      return false;
    }

    const totalSkills = this.validateTotalSkills();
    const domainStats = this.validateDomainDistribution();
    const typeStats = this.validateSkillTypeDistribution();
    const roleStats = this.validateRoleMapping();
    const orphans = this.validateOrphanSkills();
    const invalidReferences = this.validateRelatedSkills();
    const profStats = this.validateProficiencyDistribution();
    const fieldsComplete = this.validateFieldCompleteness();

    // 최종 요약 테이블
    header('📊 최종 요약');
    const summary = [
      { Metric: '총 스킬 수', Value: totalSkills },
      { Metric: '도메인 수', Value: Object.keys(domainStats).length },
      { Metric: 'Knowledge 스킬', Value: typeStats.knowledge || 0 },
      { Metric: 'Skill 스킬', Value: typeStats.skill || 0 },
      { Metric: 'Competence 스킬', Value: typeStats.competence || 0 },
      { Metric: '고아 스킬', Value: orphans.length },
      { Metric: '유효하지 않은 참조', Value: invalidReferences.length },
    ];
    console.table(summary);

    this.generateReport();

    return this.errors.length === 0;
  }
}

// ==================== 메인 실행 ====================
const dataPath = path.join(__dirname, '../public/data/robot-smartfactory.json');
const validator = new RobotDataValidator(dataPath);
const success = validator.run();

process.exit(success ? 0 : 1);
