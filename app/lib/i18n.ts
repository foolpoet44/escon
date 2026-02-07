/**
 * 다국어 지원 (i18n)
 * 기본 언어: 한국어
 */

export const translations = {
    // 네비게이션
    nav: {
        home: '홈',
        domains: '도메인',
        skills: '스킬',
        compare: '비교',
        network: '네트워크',
        tree: '트리',
        visualization: '시각화',
        analytics: '분석'
    },

    // 홈페이지
    home: {
        title: 'ESCO 스킬 온톨로지 탐색기',
        subtitle: '물리적 AI 도메인의 스킬과 역량 탐색',
        description: '로보틱스, AI & ML, 제조 등 10개 도메인에 걸친 1,640개 이상의 스킬을 탐색하세요',
        exploreButton: '탐색 시작',
        features: {
            title: '주요 기능',
            domains: {
                title: '도메인 탐색',
                description: '10개의 물리적 AI 도메인 살펴보기'
            },
            skills: {
                title: '스킬 검색',
                description: '고급 필터로 스킬 찾기'
            },
            visualization: {
                title: '데이터 시각화',
                description: '인터랙티브 차트와 그래프'
            },
            analytics: {
                title: '분석',
                description: '스킬 분포 및 통계'
            }
        },
        stats: {
            domains: '도메인',
            skills: '스킬',
            knowledge: '지식',
            competence: '역량'
        }
    },

    // 도메인
    domains: {
        title: '물리적 AI 도메인',
        description: '로보틱스부터 제조까지 10개 도메인 탐색',
        skillsCount: '스킬',
        viewDetails: '상세 보기'
    },

    // 스킬
    skills: {
        title: '스킬 탐색기',
        description: '물리적 AI 도메인의 모든 스킬 검색 및 필터링',
        searchPlaceholder: '스킬 검색...',
        filters: {
            title: '필터',
            domain: '도메인',
            type: '스킬 타입',
            allDomains: '모든 도메인',
            allTypes: '모든 타입',
            knowledge: '지식',
            competence: '역량'
        },
        results: {
            showing: '표시 중',
            of: '/',
            skills: '스킬'
        },
        clearFilters: '필터 초기화',
        noResults: '결과 없음',
        noResultsMessage: '검색 조건과 일치하는 스킬이 없습니다'
    },

    // 비교
    compare: {
        title: '도메인 비교',
        description: '서로 다른 도메인 간 스킬 비교로 중복 및 고유 역량 파악',
        selectDomains: '비교할 도메인 선택',
        selectPrompt: '최대 2개 도메인 선택',
        selected: '선택됨',
        stats: {
            commonSkills: '공통 스킬',
            similarity: '유사도 (Jaccard)',
            uniqueTo: '고유 스킬'
        },
        charts: {
            skillCount: '스킬 수 비교',
            overlap: '스킬 중복 분포',
            totalSkills: '전체 스킬',
            knowledge: '지식',
            competence: '역량'
        },
        breakdown: {
            title: '상세 스킬 분석',
            common: '공통 스킬',
            uniqueToFirst: '고유 스킬',
            uniqueToSecond: '고유 스킬'
        },
        getStarted: {
            title: '시작하기',
            message: '위에서 2개 도메인을 선택하여 비교를 시작하세요'
        }
    },

    // 네트워크
    network: {
        title: '네트워크 그래프',
        description: '스킬 관계와 도메인 연결의 인터랙티브 시각화',
        modes: {
            domainOverview: {
                title: '도메인 개요',
                description: '모든 도메인과 스킬 보기'
            },
            skillType: {
                title: '스킬 타입',
                description: '지식 vs 역량 분포'
            }
        },
        stats: {
            nodes: '노드',
            connections: '연결'
        },
        legend: {
            competence: '역량',
            knowledge: '지식',
            commonSkills: '공통 스킬'
        },
        tip: '노드 위에 마우스를 올려 연결을 강조하세요. 도메인 노드를 클릭하여 상세히 탐색하세요.',
        backToOverview: '개요로 돌아가기',
        network: '네트워크'
    },

    // 트리
    tree: {
        title: '스킬 트리',
        description: '도메인과 타입별로 구성된 스킬의 계층적 시각화',
        searchPlaceholder: '트리에서 스킬 검색...',
        clearSearch: '검색 초기화',
        modes: {
            allDomains: {
                title: '모든 도메인',
                description: '모든 도메인과 스킬 보기'
            },
            singleDomain: {
                title: '단일 도메인',
                description: '하나의 도메인에 집중'
            },
            byType: {
                title: '타입별',
                description: '지식/역량으로 그룹화'
            }
        },
        selectDomain: '도메인 선택:',
        totalSkills: '전체 스킬',
        legend: {
            root: '루트/역량',
            domain: '도메인',
            knowledge: '지식',
            skillType: '스킬 타입'
        },
        tip: '노드를 클릭하여 브랜치를 확장/축소하고 상세 정보를 확인하세요. 마우스 휠로 확대/축소, 드래그로 이동하세요.'
    },

    // 시각화
    visualization: {
        title: '데이터 시각화',
        description: '인터랙티브 차트로 스킬 분포 탐색',
        domainDistribution: '도메인별 스킬 분포',
        typeDistribution: '스킬 타입 분포',
        topDomains: '상위 도메인 (스킬 수)',
        knowledgeVsCompetence: '지식 vs 역량 비율',
        knowledge: '지식',
        competence: '역량',
        skills: '스킬'
    },

    // 분석
    analytics: {
        title: '스킬 분석',
        description: '물리적 AI 도메인의 포괄적인 통계 및 인사이트',
        overview: {
            title: '개요',
            totalSkills: '전체 스킬',
            totalDomains: '전체 도메인',
            knowledgeSkills: '지식 스킬',
            competenceSkills: '역량 스킬'
        },
        charts: {
            distribution: '도메인별 스킬 분포',
            typeComparison: '스킬 타입 비교',
            topDomains: '상위 5개 도메인',
            typeRatio: '지식 vs 역량 비율'
        }
    },

    // 공통
    common: {
        loading: '로딩 중...',
        error: '오류',
        noData: '데이터 없음',
        export: '내보내기',
        exportData: '데이터 내보내기',
        exportAllData: '모든 데이터 내보내기',
        exportCurrentView: '현재 보기 내보내기',
        exportAs: '다음으로 내보내기',
        csv: 'CSV',
        json: 'JSON',
        csvFormat: 'Excel 호환 형식',
        jsonFormat: '개발자 친화적 형식',
        skillsToExport: '내보낼 스킬',
        type: '타입',
        domain: '도메인',
        description: '설명',
        uri: 'URI',
        count: '개수',
        items: '항목',
        children: '하위 항목',
        close: '닫기'
    },

    // 스킬 타입
    skillTypes: {
        knowledge: '지식',
        'skill/competence': '역량'
    }
};

export type TranslationKey = keyof typeof translations;

export function t(key: string): string {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
        value = value[k];
        if (value === undefined) {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    }

    return value;
}
