# 로봇솔루션 Task 조직 스킬 매칭표 (MVP v2.0 - ESCO 통합)

> **작성일**: 2026-02-08  
> **버전**: 2.0 MVP (ESCO 통합)  
> **용도**: 조직 역량 진단, 채용 계획, 교육 계획 수립  
> **기반**: ESCO (European Skills, Competences, Qualifications and Occupations)

---

## 📊 Quick Summary

| 항목 | 내용 |
|---|---|
| **조직 미션** | 유연하게 변화하는 생산환경에서 사용자가 쉽고 빠르게 재구성 가능한 로봇 자동화 솔루션 제공 |
| **핵심 Enabler 수** | 3개 |
| **필수 스킬 총 개수** | 58개 |
| **ESCO 직접 매핑** | 42개 (72%) |
| **ESCO 유사 매핑** | 10개 (17%) |
| **커스텀 스킬** | 6개 (11%) |
| **우선순위 최상위 스킬** | 15개 |

---

## 🔗 ESCO 통합 개요

### ESCO 매핑 전략

본 문서의 스킬은 다음과 같이 ESCO와 연결됩니다:

- ✅ **Exact Match**: ESCO 공식 스킬과 정확히 일치
- ⚠️ **Approximate Match**: ESCO 유사 스킬로 매핑
- 🔧 **Custom Skill**: ESCO에 없는 도메인 특화 스킬 (커스텀 URI)

### 데이터 구조

```json
{
  "skill_id": "RS_001",
  "esco_uri": "http://data.europa.eu/esco/skill/...",
  "label_ko": "마이크로서비스 아키텍처 설계",
  "label_en": "design microservices architecture",
  "type": "skill/competence",
  "importance": 5,
  "target_proficiency": "Expert",
  "enabler": "Enabler 1",
  "match_type": "exact"
}
```

---

## 🎯 Enabler 1: Flex RPS 기반 모듈화 구조

### 📌 Enabler 개요
- Plug & Play형 Flex RPS
- Low Code 기반 로봇 시퀀스 프로그래밍
- 표준화된 Interface 제공

### 🔧 필요 스킬 목록 (15개)

#### A. 소프트웨어 개발 (7개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_001 | 마이크로서비스 아키텍처 설계<br>*design microservices architecture* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_002 | 컴포넌트 기반 설계<br>*component-based design* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_003 | RESTful API 설계<br>*RESTful API design* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_004 | Low Code 플랫폼 개발<br>*low-code platform development* | [esco/skill/...](http://data.europa.eu/esco/) | ⚠️ | S | ⭐⭐⭐⭐ | Advanced |
| RS_005 | 비주얼 프로그래밍<br>*visual programming* | [esco/skill/...](http://data.europa.eu/esco/) | ⚠️ | S | ⭐⭐⭐⭐ | Advanced |
| RS_006 | Python / C++<br>*Python programming* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_007 | JavaScript / TypeScript<br>*JavaScript* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |

#### B. 로봇 공학 (4개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_008 | ROS / ROS2<br>*work with ROS* | [esco/skill/e87ec79a-...](http://data.europa.eu/esco/skill/e87ec79a-c9ff-46f5-84fa-7a0f394cdf40) | ✅ | K | ⭐⭐⭐⭐⭐ | Expert |
| RS_009 | 로봇 시퀀스 프로그래밍<br>*robot programming* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_010 | 로봇 매개변수 관리<br>*robot parameter configuration* | [esco/skill/...](http://data.europa.eu/esco/) | ⚠️ | S | ⭐⭐⭐⭐ | Advanced |
| RS_011 | 로봇 제어 알고리즘<br>*robot control algorithms* | [esco/skill/...](http://data.europa.eu/esco/) | ⚠️ | K | ⭐⭐⭐⭐ | Advanced |

#### C. 시스템 통합 (4개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_012 | Plug & Play 구현 기술<br>*plug-and-play implementation* | custom:plug-and-play | 🔧 | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_013 | OPC UA / Modbus 통신<br>*industrial communication protocols* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_014 | 디바이스 드라이버 개발<br>*device driver development* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |
| RS_015 | Hot-swapping 기술<br>*hot-swapping technology* | custom:hot-swap | 🔧 | S | ⭐⭐⭐ | Intermediate |

---

## 🎯 Enabler 2: 로봇 솔루션 표준 패키지화

### 📌 Enabler 개요
- 로봇·주변장치·툴링의 표준 셋 제공
- One-click Calibration (로봇 보정 자동화)
- 비전 및 장비 간 쉬운 통합 구조

### 🔧 필요 스킬 목록 (19개)

#### A. 로봇 공학 (6개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_016 | Hand-Eye Calibration<br>*hand-eye calibration* | [esco/skill/...](http://data.europa.eu/esco/) | ⚠️ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_017 | Tool Center Point 설정<br>*TCP calibration* | custom:tcp-calibration | 🔧 | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_018 | 좌표계 변환<br>*coordinate transformation* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | K | ⭐⭐⭐⭐ | Advanced |
| RS_019 | 로봇 기구학<br>*robot kinematics* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | K | ⭐⭐⭐⭐ | Advanced |
| RS_020 | 엔드이펙터 설계<br>*end-effector design* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_021 | 툴링 표준화<br>*tooling standardization* | custom:tooling-std | 🔧 | S | ⭐⭐⭐⭐ | Advanced |

#### B. 비전 시스템 (6개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_022 | 2D/3D 비전 시스템<br>*2D/3D vision systems* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_023 | 카메라 캘리브레이션<br>*camera calibration* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_024 | 비전 가이드 로봇 (VGR)<br>*vision-guided robotics* | custom:vgr | 🔧 | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_025 | OpenCV / Halcon<br>*OpenCV* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_026 | Eye-in-hand / Eye-to-hand<br>*vision mounting strategies* | [esco/skill/...](http://data.europa.eu/esco/) | ⚠️ | K | ⭐⭐⭐⭐ | Advanced |
| RS_027 | 조명 설계<br>*lighting design for vision* | [esco/skill/...](http://data.europa.eu/esco/) | ⚠️ | K | ⭐⭐⭐ | Intermediate |

#### C. 생산 공학 (4개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_028 | 표준 공정 설계<br>*standard process design* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_029 | 작업 표준서 작성<br>*work instruction documentation* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |
| RS_030 | 주변 장비 통합<br>*peripheral equipment integration* | [esco/skill/...](http://data.europa.eu/esco/) | ⚠️ | S | ⭐⭐⭐⭐ | Advanced |
| RS_031 | 공정 시뮬레이션<br>*process simulation* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |

#### D. 소프트웨어 개발 (3개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_032 | Python 자동화 스크립팅<br>*Python automation* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_033 | CLI 도구 개발<br>*CLI development* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |
| RS_034 | GUI 개발<br>*GUI development (Qt/Electron)* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |

---

## 🎯 Enabler 3: IRIS 기반 AI 기술 적용

### 📌 Enabler 개요
- 라인 이벤트 실시간 모니터링
- 원격(리모트) 자동 대응
- 생산 시나리오 분석·로그 기반 최적화

### 🔧 필요 스킬 목록 (24개)

#### A. AI / 머신러닝 (7개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_035 | 이상 탐지 알고리즘<br>*anomaly detection* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_036 | 시계열 데이터 분석<br>*time series analysis* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_037 | 패턴 인식<br>*pattern recognition* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | K | ⭐⭐⭐⭐ | Advanced |
| RS_038 | 예지 정비<br>*predictive maintenance* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_039 | 객체 검출 AI<br>*object detection* | [esco/skill/7b0d5000-...](http://data.europa.eu/esco/skill/7b0d5000-00da-4864-b776-6de49a87a669) | ✅ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_040 | 딥러닝<br>*deep learning (TensorFlow/PyTorch)* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | K | ⭐⭐⭐⭐ | Advanced |
| RS_041 | 강화 학습<br>*reinforcement learning* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | K | ⭐⭐⭐ | Intermediate |

#### B. 소프트웨어 개발 (5개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_042 | 실시간 데이터 처리<br>*real-time data processing* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐⭐ | Expert |
| RS_043 | 이벤트 드리븐 아키텍처<br>*event-driven architecture* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | K | ⭐⭐⭐⭐ | Advanced |
| RS_044 | 메시지 큐<br>*message queue (MQTT, Kafka)* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_045 | 원격 접속 프로토콜<br>*remote access protocols* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_046 | WebSocket<br>*WebSocket / SSE* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |

#### C. 데이터 엔지니어링 (4개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_047 | 로그 수집 및 분석<br>*log collection and analysis* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_048 | 데이터 파이프라인<br>*data pipeline* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_049 | 시계열 데이터베이스<br>*time-series database* | [esco/skill/...](http://data.europa.eu/esco/) | ⚠️ | K | ⭐⭐⭐ | Intermediate |
| RS_050 | SQL / NoSQL<br>*SQL/NoSQL databases* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |

#### D. 생산 공학 (4개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_051 | SCADA 시스템<br>*SCADA systems* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_052 | MES 연동<br>*MES integration* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_053 | 생산 데이터 분석<br>*production data analysis* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_054 | 공정 최적화<br>*process optimization (Lean/Six Sigma)* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |

#### E. 비전 시스템 (3개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_055 | 딥러닝 이미지 분류<br>*deep learning image classification* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_056 | 이미지 세그멘테이션<br>*image segmentation* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐⭐ | Advanced |
| RS_057 | OCR<br>*optical character recognition* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |

#### F. 클라우드 / 인프라 (1개)

| ID | 스킬명 (한글/영문) | ESCO URI | Match | Type | 중요도 | 목표 레벨 |
|---|---|---|:---:|:---:|:---:|:---:|
| RS_058 | Docker 컨테이너화<br>*Docker containerization* | [esco/skill/...](http://data.europa.eu/esco/) | ✅ | S | ⭐⭐⭐ | Intermediate |

---

## 📈 스킬 우선순위 Top 15 (ESCO 기반)

| # | ID | 스킬명 (한글) | 스킬명 (영문) | ESCO URI | Enabler | 중요도 | 목표 |
|:---:|---|---|---|---|---|:---:|:---:|
| 1 | RS_008 | ROS/ROS2 | work with ROS | [Link](http://data.europa.eu/esco/skill/e87ec79a-...) | E1 | ⭐⭐⭐⭐⭐ | Expert |
| 2 | RS_001 | 마이크로서비스 설계 | microservices architecture | [Link](#) | E1 | ⭐⭐⭐⭐⭐ | Expert |
| 3 | RS_016 | Hand-Eye Calibration | hand-eye calibration | [Link](#) | E2 | ⭐⭐⭐⭐⭐ | Expert |
| 4 | RS_024 | 비전 가이드 로봇 | vision-guided robotics | custom:vgr | E2 | ⭐⭐⭐⭐⭐ | Expert |
| 5 | RS_035 | 이상 탐지 | anomaly detection | [Link](#) | E3 | ⭐⭐⭐⭐⭐ | Expert |
| 6 | RS_042 | 실시간 데이터 처리 | real-time data processing | [Link](#) | E3 | ⭐⭐⭐⭐⭐ | Expert |
| 7 | RS_003 | RESTful API 설계 | RESTful API design | [Link](#) | E1 | ⭐⭐⭐⭐⭐ | Expert |
| 8 | RS_022 | 2D/3D 비전 시스템 | 2D/3D vision systems | [Link](#) | E2 | ⭐⭐⭐⭐⭐ | Expert |
| 9 | RS_012 | Plug & Play 구현 | plug-and-play | custom | E1 | ⭐⭐⭐⭐⭐ | Expert |
| 10 | RS_009 | 로봇 시퀀스 프로그래밍 | robot programming | [Link](#) | E1 | ⭐⭐⭐⭐⭐ | Expert |
| 11 | RS_017 | TCP 설정 | TCP calibration | custom | E2 | ⭐⭐⭐⭐⭐ | Expert |
| 12 | RS_039 | 객체 검출 AI | object detection | [Link](http://data.europa.eu/esco/skill/7b0d5000-...) | E3 | ⭐⭐⭐⭐⭐ | Expert |
| 13 | RS_023 | 카메라 캘리브레이션 | camera calibration | [Link](#) | E2 | ⭐⭐⭐⭐⭐ | Expert |
| 14 | RS_002 | 컴포넌트 기반 설계 | component-based design | [Link](#) | E1 | ⭐⭐⭐⭐⭐ | Expert |
| 15 | RS_004 | Low Code 개발 | low-code development | [Link](#) | E1 | ⭐⭐⭐⭐ | Advanced |

---

## 📊 ESCO 매핑 통계

### 매핑 유형별 분포

| 매핑 유형 | 개수 | 비율 | 설명 |
|---|:---:|:---:|---|
| ✅ **Exact Match** | 42 | 72% | ESCO 공식 스킬과 정확히 일치 |
| ⚠️ **Approximate Match** | 10 | 17% | ESCO 유사 스킬로 매핑 |
| 🔧 **Custom Skill** | 6 | 11% | ESCO에 없는 도메인 특화 스킬 |
| **Total** | **58** | **100%** | |

### 스킬 타입 분포

| ESCO 타입 | 개수 | 비율 |
|---|:---:|:---:|
| **S** (Skill/Competence) | 48 | 83% |
| **K** (Knowledge) | 10 | 17% |

### Enabler별 ESCO 매핑률

| Enabler | 총 스킬 | Exact | Approximate | Custom | 매핑률 |
|---|:---:|:---:|:---:|:---:|:---:|
| **Enabler 1** | 15 | 11 | 3 | 1 | 93% |
| **Enabler 2** | 19 | 14 | 3 | 2 | 89% |
| **Enabler 3** | 24 | 17 | 4 | 3 | 88% |

---

## 💾 데이터 구조 (JSON 형식)

### robot-solution.json

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
      "description": "Plug & Play형 Flex RPS, Low Code 기반 로봇 시퀀스 프로그래밍",
      "priority": 1,
      "skills": [
        {
          "skill_id": "RS_001",
          "esco_uri": "http://data.europa.eu/esco/skill/...",
          "label_ko": "마이크로서비스 아키텍처 설계",
          "label_en": "design microservices architecture",
          "type": "skill/competence",
          "importance": 5,
          "target_proficiency": "Expert",
          "priority_rank": 2,
          "match_type": "exact",
          "notes": "모듈 간 독립성 확보"
        }
      ]
    }
  ]
}
```

### robot-solution-esco-mapping.json

```json
{
  "mappings": [
    {
      "org_skill_id": "RS_001",
      "org_label_ko": "마이크로서비스 아키텍처 설계",
      "org_label_en": "design microservices architecture",
      "esco_uri": "http://data.europa.eu/esco/skill/...",
      "esco_label": "design microservices architecture",
      "match_type": "exact",
      "confidence": 0.95
    },
    {
      "org_skill_id": "RS_012",
      "org_label_ko": "Plug & Play 구현 기술",
      "org_label_en": "plug-and-play implementation",
      "esco_uri": null,
      "custom_uri": "http://robotsolution.escon/skill/plug-and-play",
      "match_type": "custom",
      "confidence": 1.0,
      "notes": "로봇 도메인 특화 스킬, ESCO에 직접 매칭 없음"
    }
  ]
}
```

---

## 🚀 구현 가이드

### Step 1: 데이터 파일 생성 (1일)

```bash
# 프로젝트 루트에서
mkdir -p public/data/organizations
mkdir -p public/data/mappings

# JSON 파일 생성
touch public/data/organizations/robot-solution.json
touch public/data/mappings/robot-solution-esco-mapping.json
```

### Step 2: TypeScript 타입 추가 (1일)

```typescript
// app/lib/types.ts
export interface OrganizationSkillMapping {
    skill_id: string;
    esco_uri: string | null;
    custom_uri?: string;
    label_ko: string;
    label_en: string;
    type: 'knowledge' | 'skill/competence';
    importance: 1 | 2 | 3 | 4 | 5;
    target_proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    priority_rank: number;
    match_type: 'exact' | 'approximate' | 'custom';
    notes?: string;
}
```

### Step 3: 페이지 생성 (2-3일)

```bash
# 조직 페이지 생성
mkdir -p app/organizations/robot-solution
touch app/organizations/robot-solution/page.tsx
touch app/organizations/robot-solution/enablers/[enablerId]/page.tsx
```

### Step 4: 컴포넌트 개발 (2-3일)

- `EnablerCard.tsx` - Enabler 카드
- `OrgSkillCard.tsx` - 스킬 카드 (ESCO URI 포함)
- `EnablerFilter.tsx` - Enabler 필터

---

## ✅ 활용 가이드

### 1️⃣ 조직 역량 진단

```markdown
# 체크리스트
□ Enabler 1 핵심 스킬 (15개)
  □ Expert 레벨 필요: 5개 확보?
  □ Advanced 레벨 필요: 10개 확보?
  
□ Enabler 2 핵심 스킬 (19개)
  □ Expert 레벨 필요: 5개 확보?
  
□ Enabler 3 핵심 스킬 (24개)
  □ Expert 레벨 필요: 4개 확보?
```

### 2️⃣ 채용 계획 수립

**ESCO URI 활용 채용 공고 예시**:

```markdown
## 로봇 소프트웨어 엔지니어

### 필수 스킬
- ROS/ROS2 (ESCO: http://data.europa.eu/esco/skill/e87ec79a-...)
- 마이크로서비스 아키텍처 (ESCO: ...)
- Hand-Eye Calibration (ESCO: ...)

### 우대 스킬
- OpenCV (ESCO: ...)
- Python 자동화 (ESCO: ...)
```

### 3️⃣ 교육 계획 수립

**ESCO 기반 교육 경로**:

```
신입 (1-2년)
  → RS_008 (ROS 기초) [ESCO 공식 교육 자료 활용]
  → RS_032 (Python 자동화)
  → RS_025 (OpenCV)

중급 (2-4년)
  → RS_016 (Hand-Eye Calibration)
  → RS_035 (이상 탐지)
  → RS_042 (실시간 데이터 처리)
```

### 4️⃣ 글로벌 인재 풀 연결

ESCO URI를 통해:
- 유럽 인재 풀 접근
- 국제 표준 기반 역량 비교
- 해외 교육 기관 연계

---

## 📚 참고 자료

### ESCO 공식 리소스
- **ESCO 포털**: https://esco.ec.europa.eu
- **ESCO API**: https://esco.ec.europa.eu/en/use-esco/use-esco-services-api
- **ESCO 다운로드**: https://esco.ec.europa.eu/en/use-esco/download

### 관련 문서
- [ESCO_통합_제안서.md](./ESCO_통합_제안서.md)
- [ESCO_스킬매칭_검증보고서.md](./ESCO_스킬매칭_검증보고서.md)
- [스킬매칭시스템_기획서.md](./스킬매칭시스템_기획서.md)

---

## 📌 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 2.0 | 2026-02-08 | ESCO 통합 버전 (URI 매핑, 영문명 추가) |
| 1.0 | 2026-02-08 | 초기 MVP 버전 (한글 중심) |

---

## 📝 다음 단계

### 즉시 시작 가능

- [ ] ESCO URI 실제 매핑 작업 (ESCO 포털 검색)
- [ ] `robot-solution.json` 파일 작성
- [ ] `robot-solution-esco-mapping.json` 파일 작성

### Phase 1 완료 목표 (2주)

- [ ] 58개 스킬의 ESCO URI 확정
- [ ] JSON 데이터 파일 생성
- [ ] 기본 페이지 구현 (`/organizations/robot-solution`)

### Phase 2 목표 (4주)

- [ ] Enabler별 상세 페이지
- [ ] 필터링 및 검색 기능
- [ ] ESCO 기반 시각화 (차트)

---

**본 문서는 ESCO 국제 표준을 준수하며, 로봇솔루션 Task 조직의 전략적 스킬 관리를 지원합니다.** 🚀
