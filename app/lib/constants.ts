import { Domain, DomainKey } from './types';

// 도메인 정보 상수
export const DOMAINS: Domain[] = [
    {
        key: 'robotics',
        name: 'Robotics',
        description: '로봇 기계/구조, 조립/유지보수, HRC (Robot assembly, maintenance, HRC, mechanics)',
        icon: '🤖',
        color: '#FF6B6B',
        skillCount: 72
    },
    {
        key: 'manipulation',
        name: 'Manipulation',
        description: '조작/핸들링, 그리핑, EOAT (Grasping, handling, end effectors)',
        icon: '🦾',
        color: '#BB8FCE',
        skillCount: 81
    },
    {
        key: 'control',
        name: 'Control',
        description: '제어 시스템, 구동기, 모션 제어 (Control systems, actuators, motion control)',
        icon: '🎮',
        color: '#45B7D1',
        skillCount: 155
    },
    {
        key: 'perception',
        name: 'Perception',
        description: '센서/비전/인지, 객체 감지 (Sensors, vision, detection, perception)',
        icon: '👁️',
        color: '#4ECDC4',
        skillCount: 593
    },
    {
        key: 'navigation',
        name: 'Navigation',
        description: '경로계획, 자율 주행, SLAM (Path planning, autonomous, SLAM)',
        icon: '🧭',
        color: '#85C1E2',
        skillCount: 69
    },
    {
        key: 'ai_ml',
        name: 'AI & ML',
        description: '로봇지능, 기계학습, 예측 (ML, AI, intelligence, planning)',
        icon: '🧠',
        color: '#98D8C8',
        skillCount: 3472
    },
    {
        key: 'integration',
        name: 'Integration',
        description: '셀/라인 통합, PLC/SCADA (System integration, MES, middleware)',
        icon: '🔗',
        color: '#52B788',
        skillCount: 62
    },
    {
        key: 'safety',
        name: 'Safety',
        description: '안전 규격, 충돌 회피, 위험 평가 (Safety, compliance, risk assessment)',
        icon: '🛡️',
        color: '#F8B739',
        skillCount: 99
    },
    {
        key: 'mechatronics',
        name: 'Mechatronics',
        description: '메카트로닉스, 유공압, 구동 (Electromechanics, hydraulics, pneumatics)',
        icon: '⚙️',
        color: '#FFA07A',
        skillCount: 234
    },
    {
        key: 'manufacturing',
        name: 'Manufacturing',
        description: '공정 관리, 품질 관리, 생산 시스템 (Process, QC, production systems)',
        icon: '🏭',
        color: '#F7DC6F',
        skillCount: 561
    }
];

// 도메인 키를 실제 JSON 키로 매핑
export const DOMAIN_KEY_MAP: Record<DomainKey, string> = {
    robotics: 'robotics',
    perception: 'perception',
    control: 'control',
    mechatronics: 'mechatronics',
    ai_ml: 'ai_ml',
    manufacturing: 'manufacturing',
    manipulation: 'manipulation',
    navigation: 'navigation',
    safety: 'safety',
    integration: 'integration'
};

// 도메인별 색상 매핑
export const DOMAIN_COLORS: Record<DomainKey, string> = {
    robotics: '#FF6B6B',
    perception: '#4ECDC4',
    control: '#45B7D1',
    mechatronics: '#FFA07A',
    ai_ml: '#98D8C8',
    manufacturing: '#F7DC6F',
    manipulation: '#BB8FCE',
    navigation: '#85C1E2',
    safety: '#F8B739',
    integration: '#52B788'
};

// 스킬 타입 레이블
export const SKILL_TYPE_LABELS = {
    knowledge: 'Knowledge',
    'skill/competence': 'Skill/Competence'
} as const;

// 통계 상수
export const TOTAL_SKILLS = 1640;
export const TOTAL_DOMAINS = 10;
