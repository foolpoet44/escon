"use client";

import MermaidChart from '../components/MermaidChart';

const mindmapChart = `mindmap
  root((Physical AI<br/>Skill Ontology<br/>1,640 Skills))
    Robotics
      Robot Assembly
      Maintenance
      HRC
      Components
    Perception
      Computer Vision
      Sensors
      Image Processing
      Detection
    Control
      Control Systems
      Actuators
      Motion Control
      Feedback
    Mechatronics
      Electromechanical
      Hydraulics
      Pneumatics
      Mechanisms
    AI & ML
      Machine Learning
      Neural Networks
      Deep Learning
      Computer Vision
    Manufacturing
      Industrial Automation
      Production Systems
      Assembly
      Quality Control
    Manipulation
      Grasping
      Pick & Place
      Handling
      End Effectors
    Navigation
      Path Planning
      Localization
      Mapping
      SLAM
    Safety
      Safety Systems
      Collision Avoidance
      Risk Assessment
      Emergency Stop
    Integration
      System Integration
      Embedded Systems
      PLC/SCADA
      Real-time Systems`;

const hierarchyChart = `graph TB
    Root[Physical AI Skills<br/>1,640 Total]
    
    Root --> R[Robotics<br/>72 skills]
    Root --> P[Perception<br/>593 skills]
    Root --> C[Control<br/>155 skills]
    Root --> M[Mechatronics<br/>234 skills]
    Root --> AI[AI & ML<br/>3,472 skills]
    Root --> MF[Manufacturing<br/>561 skills]
    Root --> MP[Manipulation<br/>81 skills]
    Root --> N[Navigation<br/>69 skills]
    Root --> S[Safety<br/>99 skills]
    Root --> I[Integration<br/>62 skills]
    
    R --> R1[Robot Assembly]
    R --> R2[Maintenance]
    R --> R3[HRC]
    
    P --> P1[Computer Vision]
    P --> P2[Sensors]
    P --> P3[Image Processing]
    
    C --> C1[Control Systems]
    C --> C2[Actuators]
    C --> C3[Motion Control]
    
    M --> M1[Electromechanical]
    M --> M2[Hydraulics]
    M --> M3[Pneumatics]
    
    AI --> AI1[Machine Learning]
    AI --> AI2[Neural Networks]
    AI --> AI3[Deep Learning]
    
    MF --> MF1[Industrial Automation]
    MF --> MF2[Production Systems]
    MF --> MF3[Assembly]
    
    MP --> MP1[Grasping]
    MP --> MP2[Pick & Place]
    MP --> MP3[Handling]
    
    N --> N1[Path Planning]
    N --> N2[Localization]
    N --> N3[SLAM]
    
    S --> S1[Safety Systems]
    S --> S2[Collision Avoidance]
    S --> S3[Risk Assessment]
    
    I --> I1[System Integration]
    I --> I2[Embedded Systems]
    I --> I3[PLC/SCADA]
    
    style Root fill:#667eea,stroke:#333,stroke-width:4px,color:#fff
    style R fill:#FF6B6B,stroke:#333,stroke-width:2px
    style P fill:#4ECDC4,stroke:#333,stroke-width:2px
    style C fill:#45B7D1,stroke:#333,stroke-width:2px
    style M fill:#FFA07A,stroke:#333,stroke-width:2px
    style AI fill:#98D8C8,stroke:#333,stroke-width:2px
    style MF fill:#F7DC6F,stroke:#333,stroke-width:2px
    style MP fill:#BB8FCE,stroke:#333,stroke-width:2px
    style N fill:#85C1E2,stroke:#333,stroke-width:2px
    style S fill:#F8B739,stroke:#333,stroke-width:2px
    style I fill:#52B788,stroke:#333,stroke-width:2px`;

const networkChart = `graph LR
    subgraph Core["핵심 도메인"]
        R[Robotics]
        P[Perception]
        C[Control]
    end
    
    subgraph Support["지원 도메인"]
        M[Mechatronics]
        AI[AI & ML]
        I[Integration]
    end
    
    subgraph Application["응용 도메인"]
        MF[Manufacturing]
        MP[Manipulation]
        N[Navigation]
        S[Safety]
    end
    
    R -.-> P
    R -.-> C
    P -.-> AI
    C -.-> M
    R --> MF
    R --> MP
    R --> N
    P --> AI
    C --> S
    M --> I
    AI --> I
    
    style R fill:#FF6B6B
    style P fill:#4ECDC4
    style C fill:#45B7D1
    style M fill:#FFA07A
    style AI fill:#98D8C8
    style MF fill:#F7DC6F
    style MP fill:#BB8FCE
    style N fill:#85C1E2
    style S fill:#F8B739
    style I fill:#52B788`;

export default function VisualizationPage() {
  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">온톨로지 시각화</h1>
        <p className="page-description">
          ESCO 스킬 온톨로지의 구조와 관계를 보여주는 인터랙티브 다이어그램
        </p>
      </div>

      <div className="charts-container">
        <section className="chart-section">
          <h2 className="chart-title">📊 마인드맵 개요</h2>
          <p className="chart-description">
            10개 도메인과 하위 카테고리의 전체 개요
          </p>
          <MermaidChart chart={mindmapChart} id="mindmap" />
        </section>

        <section className="chart-section">
          <h2 className="chart-title">🌳 계층적 구조</h2>
          <p className="chart-description">
            스킬 수와 주요 카테고리를 보여주는 도메인 계층 구조
          </p>
          <MermaidChart chart={hierarchyChart} id="hierarchy" />
        </section>

        <section className="chart-section">
          <h2 className="chart-title">🔗 도메인 관계</h2>
          <p className="chart-description">
            핵심, 지원, 응용 도메인 간의 연결을 보여주는 네트워크 다이어그램
          </p>
          <MermaidChart chart={networkChart} id="network" />
        </section>
      </div>

      <style jsx>{`
        .page-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-2xl) var(--spacing-lg);
        }

        .page-header {
          text-align: center;
          margin-bottom: var(--spacing-2xl);
        }

        .page-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--spacing-md);
        }

        .page-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto;
        }

        .charts-container {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xl);
        }

        .chart-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .chart-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .chart-description {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }
      `}</style>
    </main>
  );
}
