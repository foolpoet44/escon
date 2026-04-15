// Phase 1-2: Skill Ontology Core Logic
// 스킬 온톨로지 매핑 및 관리

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

export interface OntologyNode {
  skill: Skill;
  parent?: OntologyNode;
  children: OntologyNode[];
}

export function buildOntology(skills: Skill[]): OntologyNode[] {
  // TODO: 스킬 온톨로지 구축 로직
  return [];
}
