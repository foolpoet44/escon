# app/lib

공통 라이브러리 및 유틸리티 모듈

## 디렉토리 구조

```
lib/
├── validation/     # Phase 4: DRC 엔진 로직
├── llm/            # LLM 추상화 레이어
├── ontology/       # Phase 1-2: 스킬 온톨로지 핵심 로직
└── [utils]         # 기존 유틸리티 함수
```

## 하네스 4-Phase 매핑

| 디렉토리 | Phase | 역할 |
|----------|-------|------|
| `validation/` | Phase 4 | Design Rule Check 엔진 |
| `llm/` | Phase 2 | LLM 기반 호환성 검증 |
| `ontology/` | Phase 1-2 | 스킬 온톨로지 매핑 |
