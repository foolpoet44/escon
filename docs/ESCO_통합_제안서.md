# ESCO 기반 스킬 온톨로지 통합 제안서

> **작성일**: 2026-02-08  
> **대상 프로젝트**: ESCO Skills Ontology Explorer  
> **목적**: 로봇솔루션 스킬 매칭 시스템과 기존 Physical AI 온톨로지의 효율적 통합

---

## 📋 Executive Summary

### 현재 상황 분석

#### ✅ **기존 프로젝트 (ESCO Skills Ontology Explorer)**
- **기술 스택**: Next.js 13 (App Router) + TypeScript + React
- **데이터 소스**: ESCO 공식 데이터 (public/data/skills.json)
- **도메인**: Physical AI 중심 (10개 도메인, 약 5,000+ 스킬)
- **기능**: 도메인별 탐색, 검색, 시각화 (Mermaid, Recharts, D3)
- **상태**: Phase 1 MVP 완료, Phase 2 진행 중

#### 📝 **새로 생성한 문서 (로봇솔루션 스킬 매칭)**
- **기반**: 로봇솔루션 Task 조직의 업무소개서
- **구조**: 3개 Enabler별 58개 스킬 매핑
- **특징**: 조직 전략 중심, 한글 중심, ESCO 부분 호환 (~60%)

### 🎯 통합 목표

1. **ESCO 공식 데이터 활용**: 기존 skills.json의 ESCO URI를 최대한 레버리지
2. **로봇솔루션 스킬 매칭**: 58개 스킬을 ESCO 기반 시스템에 통합
3. **조직 맞춤형 뷰**: Enabler별 스킬 필터링 및 시각화
4. **확장성**: 향후 다른 조직의 스킬 매칭 추가 가능한 구조

---

## 1. 프로젝트 현황 분석

### 1.1 기존 데이터 구조

#### **public/data/skills.json** (약 5,000+ 스킬)

```typescript
{
  "robotics": [
    {
      "uri": "http://data.europa.eu/esco/skill/...",
      "label": "human-robot collaboration",
      "type": "knowledge",
      "description": "..."
    },
    ...
  ],
  "perception": [...],  // 593개
  "ai_ml": [...],       // 3,472개
  ...
}
```

#### **app/lib/types.ts** (현재 타입 정의)

```typescript
interface Skill {
    uri: string;         // ESCO URI
    label: string;       // 스킬명
    type: SkillType;     // 'knowledge' | 'skill/competence'
    description: string; // 설명
}
```

### 1.2 로봇솔루션 스킬 매칭 데이터

```markdown
Enabler 1: Flex RPS (15개 스킬)
Enabler 2: 표준 패키지화 (19개 스킬)
Enabler 3: IRIS AI (24개 스킬)
```

**문제점**:
- 한글 스킬명 (예: "마이크로서비스 아키텍처 설계")
- ESCO URI 매핑 부재
- 중요도, 목표 레벨 등 조직 특화 메타데이터

---

## 2. 통합 전략

### 2.1 3단계 통합 접근법

```
Phase A: 데이터 매핑 및 확장 (1주)
    ↓
Phase B: UI 컴포넌트 추가 (1주)
    ↓
Phase C: 조직 맞춤형 기능 (2주)
```

### 2.2 핵심 전략

#### **전략 1: 데이터 레이어 확장** ⭐ **최우선**
기존 ESCO 스킬에 **조직 메타데이터를 "덧씌우기"** 방식

```typescript
// 새로운 타입 정의
interface OrganizationSkillMapping {
    esco_uri: string;              // 기존 ESCO 스킬 참조
    org_context: {
        organization: "로봇솔루션";
        enabler: "Enabler 1" | "Enabler 2" | "Enabler 3";
        importance: 1 | 2 | 3 | 4 | 5;
        target_proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
        priority_rank: number;
        korean_label?: string;      // 한글 스킬명
        custom_notes?: string;
    }
}
```

#### **전략 2: Virtual Domain 생성**
기존 10개 Physical AI 도메인 + **"로봇솔루션"** 가상 도메인 추가

```typescript
// constants.ts 확장
export const DOMAINS = [
    // ... 기존 10개 도메인
    {
        key: 'robotics_org',                 // 새로 추가
        name: '로봇솔루션 조직',
        description: '로봇솔루션 Task 조직의 Enabler별 핵심 스킬',
        icon: '🏢',
        color: '#FF6B35',
        skillCount: 58,
        isVirtual: true,                     // 가상 도메인 플래그
    }
];
```

#### **전략 3: 기존 스킬 재사용 + 신규 스킬 추가**
- **재사용**: 기존 skills.json에서 매칭되는 스킬 참조
- **신규 추가**: ESCO에 없는 도메인 특화 스킬은 커스텀 URI로 추가

---

## 3. 구현 방안 (Detailed Design)

### 3.1 데이터 파일 구조

#### 📁 **public/data/** 디렉토리 구조 (

확장)

```
public/data/
├── skills.json                    # 기존: ESCO 공식 스킬 (유지)
├── organizations/                 # 신규: 조직별 스킬 매핑
│   ├── robot-solution.json       # 로봇솔루션 스킬 매핑
│   └── [future-org].json         # 향후 다른 조직 추가 가능
└── mappings/                      # 신규: ESCO URI 매핑 테이블
    └── robot-solution-esco-mapping.json
```

#### 📄 **robot-solution.json** (신규 파일)

```json
{
  "organization": {
    "id": "robot_solution",
    "name": "로봇솔루션 Task",
    "name_en": "Robot Solution Task Force",
    "description": "유연하게 변화하는 생산환경에서 사용자가 쉽고 빠르게 재구성 가능한 로봇 자동화 솔루션 제공"
  },
  "enablers": [
    {
      "id": "enabler_1",
      "name": "Flex RPS 기반 모듈화 구조",
      "name_en": "Flex RPS Modular Architecture",
      "description": "Plug & Play형 Flex RPS, Low Code 기반 로봇 시퀀스 프로그래밍, 표준화된 Interface 제공",
      "priority": 1,
      "skills": [
        {
          "skill_id": "RS_001",
          "esco_uri": "http://data.europa.eu/esco/skill/...",  // 매핑된 ESCO URI
          "label_ko": "마이크로서비스 아키텍처 설계",
          "label_en": "Microservices Architecture Design",
          "importance": 5,
          "target_proficiency": "Expert",
          "priority_rank": 2,
          "notes": "모듈 간 독립성 확보"
        },
        // ... 나머지 Enabler 1 스킬
      ]
    },
    {
      "id": "enabler_2",
      "name": "로봇 솔루션 표준 패키지화",
      // ...
    },
    {
      "id": "enabler_3",
      "name": "IRIS 기반 AI 기술 적용",
      // ...
    }
  ]
}
```

#### 📄 **robot-solution-esco-mapping.json** (매핑 테이블)

```json
{
  "mappings": [
    {
      "org_skill_id": "RS_001",
      "org_label_ko": "마이크로서비스 아키텍처 설계",
      "esco_uri": "http://data.europa.eu/esco/skill/[...]",
      "esco_label": "design microservices architecture",
      "match_type": "exact",  // "exact" | "approximate" | "custom"
      "confidence": 0.95
    },
    {
      "org_skill_id": "RS_016",
      "org_label_ko": "Hand-Eye Calibration",
      "esco_uri": "http://data.europa.eu/esco/skill/[...]",
      "esco_label": "robot calibration",
      "match_type": "approximate",
      "confidence": 0.80,
      "notes": "ESCO에는 더 일반적인 'robot calibration' 스킬로 매핑"
    },
    {
      "org_skill_id": "RS_012",
      "org_label_ko": "Plug & Play 구현 기술",
      "esco_uri": null,  // ESCO에 없음
      "custom_uri": "http://robotsolution.escon/skill/plug-and-play",
      "match_type": "custom",
      "confidence": 1.0,
      "notes": "로봇 도메인 특화 스킬, ESCO에 직접 매칭 없음"
    }
  ]
}
```

---

### 3.2 TypeScript 타입 확장

#### **app/lib/types.ts** (확장)

```typescript
// ========== 기존 타입 (유지) ==========
export type SkillType = 'knowledge' | 'skill/competence';

export interface Skill {
    uri: string;
    label: string;
    type: SkillType;
    description: string;
}

// ========== 신규 타입: 조직 스킬 매핑 ==========

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface OrganizationSkillMapping {
    skill_id: string;              // 예: "RS_001"
    esco_uri: string | null;       // ESCO URI (없으면 null)
    custom_uri?: string;           // 커스텀 스킬 URI
    label_ko: string;              // 한글 스킬명
    label_en: string;              // 영문 스킬명
    importance: 1 | 2 | 3 | 4 | 5;
    target_proficiency: ProficiencyLevel;
    priority_rank: number;
    notes?: string;
}

export interface Enabler {
    id: string;                    // 예: "enabler_1"
    name: string;                  // 한글명
    name_en: string;               // 영문명
    description: string;
    priority: number;
    skills: OrganizationSkillMapping[];
}

export interface Organization {
    id: string;                    // 예: "robot_solution"
    name: string;                  // 한글명
    name_en: string;               // 영문명
    description: string;
    enablers: Enabler[];
}

// ========== 확장: 스킬 + 조직 컨텍스트 ==========

export interface EnrichedSkill extends Skill {
    // ESCO 기본 정보
    uri: string;
    label: string;
    type: SkillType;
    description: string;
    
    // 조직 컨텍스트 (선택적)
    org_context?: {
        organization: string;
        enabler: string;
        importance: number;
        target_proficiency: ProficiencyLevel;
        priority_rank: number;
        korean_label?: string;
        notes?: string;
    };
}

// ========== 도메인 타입 확장 ==========

export interface Domain {
    key: DomainKey | 'robotics_org';  // 가상 도메인 추가
    name: string;
    description: string;
    icon: string;
    color: string;
    skillCount: number;
    isVirtual?: boolean;          // 가상 도메인 플래그
}
```

---

### 3.3 데이터 로딩 함수 (app/lib/org-skills-data.ts)

#### 📄 **app/lib/org-skills-data.ts** (신규 파일)

```typescript
import { Organization, OrganizationSkillMapping, Enabler, EnrichedSkill, Skill } from './types';

// ========== 조직 스킬 데이터 로딩 ==========

export async function loadOrganizationData(orgId: string): Promise<Organization> {
    const response = await fetch(`/data/organizations/${orgId}.json`);
    if (!response.ok) {
        throw new Error(`Failed to load organization data: ${orgId}`);
    }
    return response.json();
}

export async function loadRobotSolutionData(): Promise<Organization> {
    return loadOrganizationData('robot-solution');
}

// ========== ESCO 매핑 데이터 로딩 ==========

export async function loadESCOMapping(orgId: string): Promise<any> {
    const response = await fetch(`/data/mappings/${orgId}-esco-mapping.json`);
    if (!response.ok) {
        throw new Error(`Failed to load ESCO mapping: ${orgId}`);
    }
    return response.json();
}

// ========== Enriched Skills 생성 ==========

/**
 * 조직 스킬과 ESCO 스킬을 결합하여 EnrichedSkill 생성
 */
export async function getEnrichedSkills(
    orgId: string,
    baseSkills: Record<string, Skill[]>  // 기존 skills.json 데이터
): Promise<EnrichedSkill[]> {
    const orgData = await loadOrganizationData(orgId);
    const mapping = await loadESCOMapping(orgId);
    
    const enrichedSkills: EnrichedSkill[] = [];
    
    // 각 Enabler별로 스킬 처리
    for (const enabler of orgData.enablers) {
        for (const orgSkill of enabler.skills) {
            // ESCO URI로 기존 스킬 찾기
            let baseSkill: Skill | null = null;
            
            if (orgSkill.esco_uri) {
                baseSkill = findSkillByURI(baseSkills, orgSkill.esco_uri);
            }
            
            // EnrichedSkill 생성
            const enriched: EnrichedSkill = {
                // ESCO 기본 정보 (있으면 사용, 없으면 커스텀)
                uri: orgSkill.esco_uri || orgSkill.custom_uri || `custom:${orgSkill.skill_id}`,
                label: baseSkill?.label || orgSkill.label_en,
                type: baseSkill?.type || 'skill/competence',
                description: baseSkill?.description || '',
                
                // 조직 컨텍스트
                org_context: {
                    organization: orgData.name,
                    enabler: enabler.name,
                    importance: orgSkill.importance,
                    target_proficiency: orgSkill.target_proficiency,
                    priority_rank: orgSkill.priority_rank,
                    korean_label: orgSkill.label_ko,
                    notes: orgSkill.notes
                }
            };
            
            enrichedSkills.push(enriched);
        }
    }
    
    return enrichedSkills;
}

// ========== 유틸리티 함수 ==========

function findSkillByURI(
    skillsData: Record<string, Skill[]>,
    uri: string
): Skill | null {
    for (const domain of Object.values(skillsData)) {
        const found = domain.find(skill => skill.uri === uri);
        if (found) return found;
    }
    return null;
}

// ========== Enabler별 필터링 ==========

export function getSkillsByEnabler(
    enrichedSkills: EnrichedSkill[],
    enablerId: string
): EnrichedSkill[] {
    return enrichedSkills.filter(
        skill => skill.org_context?.enabler.includes(enablerId)
    );
}

// ========== 중요도별 필터링 ==========

export function getTopPrioritySkills(
    enrichedSkills: EnrichedSkill[],
    topN: number = 15
): EnrichedSkill[] {
    return enrichedSkills
        .sort((a, b) => 
            (a.org_context?.priority_rank || 999) - (b.org_context?.priority_rank || 999)
        )
        .slice(0, topN);
}

// ========== 통계 계산 ==========

export function calculateOrgStatistics(org: Organization) {
    const totalSkills = org.enablers.reduce(
        (sum, enabler) => sum + enabler.skills.length,
        0
    );
    
    const byEnabler = org.enablers.map(enabler => ({
        enabler: enabler.name,
        count: enabler.skills.length
    }));
    
    const byImportance = [1, 2, 3, 4, 5].map(level => ({
        level,
        count: org.enablers.flatMap(e => e.skills)
            .filter(s => s.importance === level).length
    }));
    
    return {
        totalSkills,
        totalEnablers: org.enablers.length,
        byEnabler,
        byImportance
    };
}
```

---

### 3.4 UI 컴포넌트 추가

#### 📁 **app/components/** (신규 컴포넌트)

##### 1. **EnablerCard.tsx** - Enabler 카드

```typescript
import React from 'react';
import { Enabler } from '../lib/types';

interface EnablerCardProps {
    enabler: Enabler;
    onClick?: () => void;
}

export default function EnablerCard({ enabler, onClick }: EnablerCardProps) {
    return (
        <div 
            className="enabler-card"
            onClick={onClick}
            style={{
                border: '2px solid #4ECDC4',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}
        >
            <div className="enabler-header">
                <span className="priority-badge">Priority {enabler.priority}</span>
                <h3>{enabler.name}</h3>
                <p className="enabler-subtitle">{enabler.name_en}</p>
            </div>
            
            <p className="enabler-description">{enabler.description}</p>
            
            <div className="enabler-stats">
                <span className="stat">
                    <strong>{enabler.skills.length}</strong> 스킬
                </span>
                <span className="stat">
                    <strong>{enabler.skills.filter(s => s.importance === 5).length}</strong> 최우선
                </span>
            </div>
        </div>
    );
}
```

##### 2. **OrgSkillCard.tsx** - 조직 스킬 카드 (ESCO + 조직 메타데이터)

```typescript
import React from 'react';
import { EnrichedSkill } from '../lib/types';

interface OrgSkillCardProps {
    skill: EnrichedSkill;
}

export default function OrgSkillCard({ skill }: OrgSkillCardProps) {
    const { org_context } = skill;
    
    // 중요도별 색상
    const importanceColor = {
        5: '#FF6B6B',
        4: '#FFA500',
        3: '#FFD93D',
        2: '#6BCF7F',
        1: '#95E1D3'
    }[org_context?.importance || 1];
    
    return (
        <div className="org-skill-card">
            {/* 중요도 배지 */}
            <div 
                className="importance-badge"
                style={{ backgroundColor: importanceColor }}
            >
                {'⭐'.repeat(org_context?.importance || 1)}
            </div>
            
            {/* 스킬명 (한글 + 영문) */}
            <h4>{org_context?.korean_label || skill.label}</h4>
            {org_context?.korean_label && (
                <p className="skill-label-en">{skill.label}</p>
            )}
            
            {/* ESCO 타입 */}
            <span className={`skill-type ${skill.type}`}>
                {skill.type === 'knowledge' ? '📚 Knowledge' : '🛠️ Skill'}
            </span>
            
            {/* 목표 레벨 */}
            {org_context && (
                <div className="proficiency-target">
                    <span>목표: </span>
                    <strong>{org_context.target_proficiency}</strong>
                </div>
            )}
            
            {/* Enabler 태그 */}
            {org_context && (
                <div className="enabler-tag">
                    📍 {org_context.enabler}
                </div>
            )}
            
            {/* 설명 */}
            <p className="skill-description">{skill.description}</p>
            
            {/* ESCO URI 링크 */}
            <a 
                href={skill.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="esco-link"
            >
                🔗 ESCO
            </a>
        </div>
    );
}
```

##### 3. **EnablerFilter.tsx** - Enabler 필터

```typescript
'use client';
import React from 'react';
import { Enabler } from '../lib/types';

interface EnablerFilterProps {
    enablers: Enabler[];
    selectedEnablers: string[];
    onFilterChange: (enablerIds: string[]) => void;
}

export default function EnablerFilter({ 
    enablers, 
    selectedEnablers, 
    onFilterChange 
}: EnablerFilterProps) {
    const toggleEnabler = (enablerId: string) => {
        const newSelection = selectedEnablers.includes(enablerId)
            ? selectedEnablers.filter(id => id !== enablerId)
            : [...selectedEnablers, enablerId];
        onFilterChange(newSelection);
    };
    
    return (
        <div className="enabler-filter">
            <h3>Enabler 필터</h3>
            <div className="filter-buttons">
                {enablers.map(enabler => (
                    <button
                        key={enabler.id}
                        className={`filter-btn ${
                            selectedEnablers.includes(enabler.id) ? 'active' : ''
                        }`}
                        onClick={() => toggleEnabler(enabler.id)}
                    >
                        {enabler.name}
                        <span className="count">({enabler.skills.length})</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
```

---

### 3.5 페이지 생성

#### 📁 **app/organizations/** (신규 디렉토리)

##### **app/organizations/[orgId]/page.tsx** - 조직 상세 페이지

```typescript
import React from 'react';
import { loadOrganizationData } from '@/app/lib/org-skills-data';
import EnablerCard from '@/app/components/EnablerCard';

export default async function OrganizationPage({ 
    params 
}: { 
    params: { orgId: string } 
}) {
    const orgData = await loadOrganizationData(params.orgId);
    
    return (
        <div className="organization-page">
            {/* 조직 헤더 */}
            <header className="org-header">
                <h1>{orgData.name}</h1>
                <p className="org-subtitle">{orgData.name_en}</p>
                <p className="org-description">{orgData.description}</p>
            </header>
            
            {/* 통계 요약 */}
            <section className="org-stats">
                <div className="stat-card">
                    <h3>{orgData.enablers.length}</h3>
                    <p>Enablers</p>
                </div>
                <div className="stat-card">
                    <h3>
                        {orgData.enablers.reduce((sum, e) => sum + e.skills.length, 0)}
                    </h3>
                    <p>Total Skills</p>
                </div>
            </section>
            
            {/* Enabler 카드 그리드 */}
            <section className="enablers-section">
                <h2>핵심 Enablers</h2>
                <div className="enabler-grid">
                    {orgData.enablers.map(enabler => (
                        <EnablerCard 
                            key={enabler.id} 
                            enabler={enabler}
                            onClick={() => {
                                window.location.href = 
                                    `/organizations/${params.orgId}/enablers/${enabler.id}`;
                            }}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
```

##### **app/organizations/[orgId]/enablers/[enablerId]/page.tsx** - Enabler 상세

```typescript
'use client';
import React, { useEffect, useState } from 'react';
import { loadOrganizationData, loadSkillsData, getEnrichedSkills } from '@/app/lib/org-skills-data';
import { EnrichedSkill, Organization } from '@/app/lib/types';
import OrgSkillCard from '@/app/components/OrgSkillCard';

export default function EnablerDetailPage({ 
    params 
}: { 
    params: { orgId: string; enablerId: string } 
}) {
    const [enrichedSkills, setEnrichedSkills] = useState<EnrichedSkill[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function loadData() {
            const orgData = await loadOrganizationData(params.orgId);
            const baseSkills = await loadSkillsData();  // 기존 skills.json
            const enriched = await getEnrichedSkills(params.orgId, baseSkills);
            
            // 해당 Enabler의 스킬만 필터링
            const filtered = enriched.filter(
                skill => skill.org_context?.enabler.includes(params.enablerId)
            );
            
            setEnrichedSkills(filtered);
            setLoading(false);
        }
        
        loadData();
    }, [params.orgId, params.enablerId]);
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="enabler-detail-page">
            <h1>Enabler: {params.enablerId}</h1>
            
            {/* 스킬 그리드 */}
            <div className="skills-grid">
                {enrichedSkills.map((skill, idx) => (
                    <OrgSkillCard key={idx} skill={skill} />
                ))}
            </div>
        </div>
    );
}
```

---

### 3.6 네비게이션 업데이트

#### **app/components/Navigation.tsx** (수정)

```typescript
// 기존 네비게이션에 "조직" 메뉴 추가

<nav>
    <Link href="/">Home</Link>
    <Link href="/domains">Domains</Link>
    <Link href="/skills">Skills</Link>
    <Link href="/organizations">Organizations</Link>  {/* 신규 */}
    <Link href="/analytics">Analytics</Link>
    <Link href="/visualization">Visualization</Link>
</nav>
```

#### **app/organizations/page.tsx** - 조직 목록 페이지

```typescript
export default function OrganizationsPage() {
    const organizations = [
        {
            id: 'robot-solution',
            name: '로봇솔루션 Task',
            description: '로봇 자동화 솔루션 제공 조직',
            skillCount: 58
        },
        // 향후 다른 조직 추가 가능
    ];
    
    return (
        <div>
            <h1>Organizations</h1>
            <p>조직별 스킬 매칭 시스템</p>
            
            <div className="org-cards">
                {organizations.map(org => (
                    <div key={org.id} className="org-card">
                        <h2>{org.name}</h2>
                        <p>{org.description}</p>
                        <span>{org.skillCount} 스킬</span>
                        <button onClick={() => window.location.href = `/organizations/${org.id}`}>
                            탐색하기 →
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

---

## 4. 시각화 확장

### 4.1 Enabler별 스킬 분포 차트

#### **app/organizations/[orgId]/analytics/page.tsx**

```typescript
'use client';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { calculateOrgStatistics } from '@/app/lib/org-skills-data';

export default function OrgAnalyticsPage({ params }: { params: { orgId: string } }) {
    const [stats, setStats] = useState(null);
    
    useEffect(() => {
        async function loadStats() {
            const orgData = await loadOrganizationData(params.orgId);
            const calculated = calculateOrgStatistics(orgData);
            setStats(calculated);
        }
        loadStats();
    }, [params.orgId]);
    
    if (!stats) return <div>Loading...</div>;
    
    return (
        <div>
            <h1>조직 분석</h1>
            
            {/* Enabler별 스킬 수 */}
            <section>
                <h2>Enabler별 스킬 분포</h2>
                <BarChart width={600} height={300} data={stats.byEnabler}>
                    <XAxis dataKey="enabler" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4ECDC4" />
                </BarChart>
            </section>
            
            {/* 중요도별 분포 */}
            <section>
                <h2>중요도별 스킬 분포</h2>
                <BarChart width={600} height={300} data={stats.byImportance}>
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FF6B6B" />
                </BarChart>
            </section>
        </div>
    );
}
```

---

## 5. 구현 로드맵

### Phase A: 데이터 준비 (1주)

#### Week 1️⃣: 데이터 매핑 및 파일 생성

**Day 1-2**: ESCO URI 매핑 작업
- [ ] 로봇솔루션 58개 스킬의 ESCO URI 조사
- [ ] `robot-solution-esco-mapping.json` 생성
- [ ] 매핑 불가 스킬 커스텀 URI 정의

**Day 3-4**: 조직 데이터 파일 생성
- [ ] `robot-solution.json` 작성
- [ ] 3개 Enabler별 스킬 구조화
- [ ] 중요도, 목표 레벨 등 메타데이터 입력

**Day 5**: 데이터 검증
- [ ] JSON 스키마 검증
- [ ] 데이터 로딩 테스트

---

### Phase B: 백엔드 로직 (1주)

#### Week 2️⃣: 데이터 레이어 구현

**Day 1-2**: 타입 & 유틸리티 함수
- [ ] `types.ts` 확장 (Organization, Enabler, EnrichedSkill)
- [ ] `org-skills-data.ts` 작성
- [ ] getEnrichedSkills 함수 구현

**Day 3-4**: 페이지 서버 컴포넌트
- [ ] `/organizations/page.tsx` 생성
- [ ] `/organizations/[orgId]/page.tsx` 생성
- [ ] `/organizations/[orgId]/enablers/[enablerId]/page.tsx`

**Day 5**: 테스트 및 디버깅
- [ ] 데이터 로딩 테스트
- [ ] Enriched Skills 생성 검증

---

### Phase C: UI 컴포넌트 (1주)

#### Week 3️⃣: 프론트엔드 구현

**Day 1-2**: 기본 컴포넌트
- [ ] `EnablerCard.tsx` 구현
- [ ] `OrgSkillCard.tsx` 구현
- [ ] `EnablerFilter.tsx` 구현

**Day 3-4**: 고급 기능
- [ ] 검색 기능 (조직 스킬용)
- [ ] 필터링 (중요도, Enabler)
- [ ] 정렬 (우선순위, 중요도)

**Day 5**: 스타일링
- [ ] CSS 작성 (조직 테마)
- [ ] 반응형 레이아웃
- [ ] 다크 모드 적용

---

### Phase D: 시각화 & 분석 (1주)

#### Week 4️⃣: 고급 기능

**Day 1-2**: 분석 페이지
- [ ] Enabler별 스킬 분포 차트
- [ ] 중요도별 분포 차트
- [ ] ESCO 매칭률 통계

**Day 3-4**: 추가 시각화
- [ ] 네트워크 그래프 (Enabler-스킬 관계)
- [ ] 스킬 트리 (계층 구조)

**Day 5**: QA & 문서화
- [ ] 전체 기능 테스트
- [ ] README 업데이트
- [ ] 사용자 가이드 작성

---

## 6. 장점 및 효과

### 6.1 기술적 장점

✅ **기존 시스템 재사용**: 기존 ESCO 데이터 및 UI 컴포넌트 100% 활용  
✅ **확장성**: 새로운 조직 추가 시 JSON 파일만 추가하면 됨  
✅ **ESCO 표준 준수**: 공식 ESCO URI 활용으로 국제 표준 호환성  
✅ **유연한 매핑**: exact/approximate/custom 매칭으로 ESCO와 조직 스킬 연결

### 6.2 사용자 경험

✅ **통합 탐색**: 하나의 플랫폼에서 ESCO 공식 스킬 + 조직 맞춤 스킬 모두 탐색  
✅ **조직 맥락 제공**: 동일 ESCO 스킬이라도 조직별 중요도/목표 레벨 확인  
✅ **시각화**: Enabler별 스킬 분포, 우선순위 등 직관적 시각화  

### 6.3 조직 차원 효과

✅ **데이터 기반 의사결정**: ESCO 표준 + 조직 전략 결합  
✅ **역량 관리**: 조직 필요 스킬 vs ESCO 기준 비교 가능  
✅ **채용/교육 전략**: ESCO URI 기반 글로벌 인재 풀 접근  

---

## 7. 예시 시나리오

### 시나리오 1: 신규 팀원의 학습 경로 탐색

1. `/organizations/robot-solution` 페이지 방문
2. "Enabler 2: 로봇 솔루션 표준 패키지화" 카드 클릭
3. 19개 스킬 목록 확인
4. "Hand-Eye Calibration" 스킬 클릭
   - 한글명, 영문명, ESCO 설명 확인
   - 목표 레벨: Expert
   - 중요도: ⭐⭐⭐⭐⭐
   - ESCO URI 클릭 → 공식 ESCO 페이지로 이동
   - 관련 교육 자료 링크

### 시나리오 2: HR 담당자의 채용 요건 정의

1. `/organizations/robot-solution/analytics` 페이지
2. Top 15 우선순위 스킬 차트 확인
3. "ROS/ROS2" 스킬 상세 보기
   - ESCO 공식 정의 확인
   - 다른 유럽 기업의 동일 스킬 수요 파악
4. 채용 공고에 ESCO URI 포함하여 국제 표준 준수

### 시나리오 3: 조직장의 스킬 갭 분석

1. `/organizations/robot-solution` 방문
2. "Enabler 3: IRIS AI" 선택
3. 24개 스킬 중 부족 스킬 식별
4. "이상 탐지 알고리즘" 스킬
   - 현재 보유 인원: 2명
   - 목표: 7명
   - 갭: 5명 부족
5. 교육 계획 수립 (ESCO 기반 교육 과정 검색)

---

## 8. 차별화 포인트

### vs 기존 ESCO 포털

| 항목 | ESCO 공식 포털 | 우리 시스템 |
|---|---|---|
| **데이터** | 13,939개 범용 스킬 | ESCO + 조직 맞춤 스킬 |
| **구조** | 도메인 중심 | 조직 전략(Enabler) 중심 |
| **컨텍스트** | 없음 | 중요도, 목표 레벨, 우선순위 |
| **시각화** | 기본 검색 | 인터랙티브 차트, 그래프 |
| **사용자** | 일반 HR | 특정 조직 구성원 |

### 우리의 강점

1. **이중 레이어 구조**: ESCO 표준 + 조직 맞춤화
2. **전략 연계**: Enabler와 스킬의 명확한 연결
3. **실무 중심**: 중요도, 우선순위 등 실무에 필요한 메타데이터

---

## 9. 다음 단계 제안

### 즉시 시작 가능한 작업

1. **ESCO URI 매핑 스프레드시트 작성** (1-2일)
   - 58개 스킬 × ESCO URI 조사
   - Google Sheets 또는 Excel
   - 매핑 품질 (exact/approximate/custom) 표시

2. **pilot JSON 파일 생성** (1일)
   - Enabler 1의 15개 스킬만 우선 작성
   - 데이터 로딩 테스트

3. **기본 UI 프로토타입** (2-3일)
   - EnablerCard 컴포넌트만 먼저 구현
   - 조직 목록 페이지 생성

---

## 10. 리스크 및 대응 방안

### Risk 1: ESCO URI 매핑 어려움

**문제**: 일부 로봇솔루션 스킬이 ESCO에 정확히 매칭되지 않음

**대응**:
- Approximate 매칭 허용 (유사 스킬 연결)
- Custom URI 생성 (커스텀 스킬로 등록)
- 매핑 신뢰도(confidence) 표시

### Risk 2: 데이터 중복 관리

**문제**: 동일 스킬이 ESCO + 조직 데이터에 존재

**대응**:
- "참조" 방식: 조직 데이터는 ESCO URI만 저장
- 중복 스토리지 없음, 조회 시 결합

### Risk 3: 성능 이슈

**문제**: 5,000+ ESCO 스킬 + 조직 스킬 로딩 시간

**대응**:
- Next.js Static Generation (SSG) 활용
- Incremental Static Regeneration (ISR)
- 필요 시 Redis 캐싱

---

## 11. 결론

### 핵심 제안

✨ **"ESCO 기반 위에 조직 레이어를 덧씌우는 방식"**

- 기존 Physical AI 온톨로지 Explorer 유지
- 로봇솔루션 스킬을 **가상 도메인**으로 추가
- ESCO URI로 기존 스킬과 연결
- 조직 특화 메타데이터(중요도, Enabler) 별도 관리

### 구현 우선순위

1. **P0 (필수)**: 데이터 매핑 + 기본 페이지 (2주)
2. **P1 (중요)**: 필터링 + 기본 시각화 (1주)
3. **P2 (개선)**: 고급 시각화 + 분석 (1주)

### 기대효과

📊 **조직 역량의 디지털화**  
🔗 **ESCO 국제 표준과의 연결**  
🎯 **전략 중심의 스킬 관리**  
🚀 **확장 가능한 플랫폼** (다른 조직 추가 가능)

---

**이 제안서를 기반으로 즉시 구현을 시작할 수 있습니다!** 🚀

다음 단계: ESCO URI 매핑 작업 시작하시겠습니까?

---

## 부록 A: 파일 체크리스트

### 신규 생성 파일

```
✅ public/data/organizations/robot-solution.json
✅ public/data/mappings/robot-solution-esco-mapping.json
✅ app/lib/org-skills-data.ts
✅ app/lib/types.ts (확장)
✅ app/components/EnablerCard.tsx
✅ app/components/OrgSkillCard.tsx
✅ app/components/EnablerFilter.tsx
✅ app/organizations/page.tsx
✅ app/organizations/[orgId]/page.tsx
✅ app/organizations/[orgId]/enablers/[enablerId]/page.tsx
✅ app/organizations/[orgId]/analytics/page.tsx
```

### 수정 파일

```
🔄 app/components/Navigation.tsx (조직 메뉴 추가)
🔄 app/lib/constants.ts (DOMAINS에 robotics_org 추가)
```

---

**문서 정보**

- **작성자**: AI Assistant (Antigravity)
- **작성일**: 2026-02-08
- **버전**: 1.0
- **승인자**: [TBD]
