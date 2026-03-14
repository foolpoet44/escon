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

// ========== 알고리즘 설정 상수 ==========

/**
 * 불용어 목록 (유사도 계산에서 제외할 일반적인 단어)
 * 기술 문서에서 자주 등장하지만 의미 구분에 기여하지 않는 단어들
 */
export const STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must',
    'it', 'its', 'this', 'that', 'these', 'those', 'such', 'which',
    'who', 'whom', 'what', 'where', 'when', 'how', 'not', 'no', 'nor',
    'if', 'then', 'than', 'so', 'very', 'just', 'about', 'also', 'more',
    'other', 'some', 'any', 'all', 'each', 'every', 'both', 'few', 'most',
    'own', 'same', 'into', 'over', 'after', 'before', 'between', 'under',
    'through', 'during', 'above', 'below', 'up', 'down', 'out', 'off',
    'use', 'used', 'using', 'include', 'including', 'includes',
    'based', 'related', 'various', 'different', 'specific', 'general',
]);

/**
 * 기술 용어 정규화 매핑
 * 동일한 개념을 가리키는 다양한 표현을 통일
 */
export const TERM_NORMALIZATIONS: Record<string, string> = {
    'programming': 'program',
    'programmer': 'program',
    'programs': 'program',
    'controlling': 'control',
    'controller': 'control',
    'controllers': 'control',
    'controlled': 'control',
    'controls': 'control',
    'manufacturing': 'manufacture',
    'manufactured': 'manufacture',
    'manufacturer': 'manufacture',
    'designing': 'design',
    'designed': 'design',
    'designs': 'design',
    'designer': 'design',
    'engineering': 'engineer',
    'engineered': 'engineer',
    'engineers': 'engineer',
    'automated': 'automate',
    'automation': 'automate',
    'automating': 'automate',
    'robotic': 'robot',
    'robotics': 'robot',
    'robots': 'robot',
    'sensing': 'sensor',
    'sensors': 'sensor',
    'systems': 'system',
    'processing': 'process',
    'processes': 'process',
    'processed': 'process',
    'planning': 'plan',
    'planned': 'plan',
    'plans': 'plan',
    'planner': 'plan',
    'monitoring': 'monitor',
    'monitors': 'monitor',
    'monitored': 'monitor',
    'testing': 'test',
    'tested': 'test',
    'tests': 'test',
    'tester': 'test',
    'analysing': 'analyse',
    'analyzing': 'analyse',
    'analysis': 'analyse',
    'analytical': 'analyse',
    'inspection': 'inspect',
    'inspecting': 'inspect',
    'inspected': 'inspect',
    'integration': 'integrate',
    'integrating': 'integrate',
    'integrated': 'integrate',
    'maintenance': 'maintain',
    'maintaining': 'maintain',
    'maintained': 'maintain',
    'calibration': 'calibrate',
    'calibrating': 'calibrate',
    'calibrated': 'calibrate',
    'detection': 'detect',
    'detecting': 'detect',
    'detected': 'detect',
    'optimization': 'optimize',
    'optimizing': 'optimize',
    'optimised': 'optimize',
    'optimisation': 'optimize',
    'simulation': 'simulate',
    'simulating': 'simulate',
    'simulated': 'simulate',
    'measurement': 'measure',
    'measuring': 'measure',
    'measured': 'measure',
    'measurements': 'measure',
    'communication': 'communicate',
    'communications': 'communicate',
    'communicating': 'communicate',
    'configuration': 'configure',
    'configuring': 'configure',
    'configured': 'configure',
    'navigation': 'navigate',
    'navigating': 'navigate',
    'navigational': 'navigate',
    'manipulation': 'manipulate',
    'manipulating': 'manipulate',
    'manipulated': 'manipulate',
    'perception': 'perceive',
    'perceiving': 'perceive',
    'classification': 'classify',
    'classifying': 'classify',
    'classified': 'classify',
    'recognition': 'recognize',
    'recognizing': 'recognize',
    'recognised': 'recognize',
    'visualization': 'visualize',
    'visualizing': 'visualize',
    'visualised': 'visualize',
};

/**
 * 알고리즘 관련 설정값
 * 각 상수에는 해당 값이 선택된 근거가 주석으로 포함됨
 */
export const ALGORITHM_CONFIG = {
    /** 스킬 간 유사도 링크 생성 임계값 (0~1)
     *  0.25 이상이면 의미 있는 키워드 겹침으로 판단
     *  불용어 제거 + 정규화 후의 임계값이므로 기존 0.3보다 낮게 설정 */
    SIMILARITY_THRESHOLD: 0.25,

    /** 조직 내 스킬-스킬 관계 강도 임계값 (0~1)
     *  0.4 이상이면 유의미한 관련성으로 판단 (동일 Enabler + 1개 이상 특성 공유) */
    RELATIONSHIP_THRESHOLD: 0.4,

    /** 도메인당 네트워크 그래프에 표시할 최대 스킬 수
     *  성능 최적화와 가독성을 위한 제한 */
    MAX_SKILLS_PER_DOMAIN: 50,

    /** TF-IDF 계산 시 최소 단어 길이 */
    MIN_WORD_LENGTH: 2,

    /** 관계 강도 가중치 (합계 = 1.0)
     *  - SAME_ENABLER: 동일 Enabler 소속 여부 (가장 높음 - 업무적 연관성)
     *  - SAME_TYPE: knowledge/competence 동일 여부
     *  - SIMILAR_IMPORTANCE: 중요도 차이 ≤ 1
     *  - SAME_PROFICIENCY: 목표 숙련도 동일 여부 */
    WEIGHTS: {
        SAME_ENABLER: 0.3,
        SAME_TYPE: 0.2,
        SIMILAR_IMPORTANCE: 0.2,
        SAME_PROFICIENCY: 0.3,
    },

    /** AI 매칭 설정 */
    AI: {
        MODEL: 'gemini-2.5-flash',
        TEMPERATURE: 0.2,
        MAX_OUTPUT_TOKENS: 2048,
    },

    /** 검색 기본 설정 */
    SEARCH: {
        DEFAULT_LIMIT: 20,
        DEFAULT_OFFSET: 0,
    },

    /** 네트워크 그래프 시각화 설정 */
    GRAPH: {
        NODE_REL_SIZE: 6,
        LINK_PARTICLES: 2,
        VELOCITY_DECAY: 0.3,
        COOLDOWN_TIME: 3000,
        BACKGROUND_COLOR: '#1a1a2e',
    },
} as const;
