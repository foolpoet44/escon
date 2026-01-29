Phase 1 MVP Frontend Skeleton for Physical AI Ontology

Overview
- Lightweight MVP frontend scaffold to surface the Physical AI Ontology data (physical_ai_ontology.json)
- Dashboard + Advanced Skill Explorer + Domain Pages core structure
- Data binding plan to wire data to ontology_explorer.html reference

How to run (local)
1. Install dependencies
   - cd frontend
   - npm install
2. Run in dev mode
   - npm run dev
3. Open in browser
   - http://localhost:3000

Project structure (Phase 1 MVP MVP)
- frontend/
  - package.json
  - README.md
  - tsconfig.json
  - next.config.js
  - public/ (ontology_explorer.html)
  - src/
    - app/
      - page.tsx
      - domain/[domain].tsx
      - components/
        - Dashboard.tsx
        - SkillCard.tsx
        - NetworkGraph.tsx
        - SkillTree.tsx
      - hooks/
        - useOntology.ts
      - styles/
        - theme.ts
        - globals.css
      - data/
        - physical_ai_ontology.json
