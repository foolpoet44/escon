import { Domain, DomainKey } from './types';

// 도메인 정보 상수
export const DOMAINS: Domain[] = [
    {
        key: 'robotics',
        name: 'Robotics',
        description: 'Robot assembly, maintenance, human-robot collaboration, and robotic components',
        icon: '🤖',
        color: '#FF6B6B',
        skillCount: 72
    },
    {
        key: 'perception',
        name: 'Perception',
        description: 'Computer vision, sensors, image processing, and detection systems',
        icon: '👁️',
        color: '#4ECDC4',
        skillCount: 593
    },
    {
        key: 'control',
        name: 'Control',
        description: 'Control systems, actuators, motion control, and feedback mechanisms',
        icon: '🎮',
        color: '#45B7D1',
        skillCount: 155
    },
    {
        key: 'mechatronics',
        name: 'Mechatronics',
        description: 'Electromechanical systems, hydraulics, pneumatics, and mechanisms',
        icon: '⚙️',
        color: '#FFA07A',
        skillCount: 234
    },
    {
        key: 'ai_ml',
        name: 'AI & ML',
        description: 'Machine learning, neural networks, deep learning, and computer vision',
        icon: '🧠',
        color: '#98D8C8',
        skillCount: 3472
    },
    {
        key: 'manufacturing',
        name: 'Manufacturing',
        description: 'Industrial automation, production systems, assembly, and quality control',
        icon: '🏭',
        color: '#F7DC6F',
        skillCount: 561
    },
    {
        key: 'manipulation',
        name: 'Manipulation',
        description: 'Grasping, pick and place operations, handling, and end effectors',
        icon: '🦾',
        color: '#BB8FCE',
        skillCount: 81
    },
    {
        key: 'navigation',
        name: 'Navigation',
        description: 'Path planning, localization, mapping, and SLAM',
        icon: '🧭',
        color: '#85C1E2',
        skillCount: 69
    },
    {
        key: 'safety',
        name: 'Safety',
        description: 'Safety systems, collision avoidance, risk assessment, and emergency stop',
        icon: '🛡️',
        color: '#F8B739',
        skillCount: 99
    },
    {
        key: 'integration',
        name: 'Integration',
        description: 'System integration, embedded systems, PLC/SCADA, and real-time systems',
        icon: '🔗',
        color: '#52B788',
        skillCount: 62
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
