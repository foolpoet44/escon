import Link from 'next/link';

export default function Home() {
    return (
        <main className="main-container">
            <div className="hero-section">
                <h1 className="hero-title">
                    Robotics Tech for Smart Factory
                </h1>
                <p className="hero-subtitle">
                    스마트 팩토리 로봇기술 스택(Robot Tech Stack) 기반 역량/스킬 온톨로지
                </p>
                <div className="hero-description">
                    <p>
                        로보틱스, 조작, 제어, 센싱, 통합 등 로봇기술 핵심 도메인을 연결하여,<br />
                        제조 현장 적용에 필요한 스킬셋과 엔지니어링 요구를 탐색하세요.
                    </p>
                </div>
                <div className="cta-buttons">
                    <Link href="/domains" className="btn-primary">
                        로봇기술 도메인 탐색
                    </Link>
                    <Link href="/organizations" className="btn-secondary">
                        조직/셀 스킬 보기
                    </Link>
                    <Link href="/visualization" className="btn-secondary">
                        기술 맵 시각화
                    </Link>
                </div>
            </div>

            <div className="features-grid">
                <Link href="/organizations" className="feature-card featured">
                    <div className="feature-icon">🏢</div>
                    <h3>로봇 기술 역량 매칭</h3>
                    <p>조직/셀 단위 Enabler와 로봇기술 스킬 매칭 시스템</p>
                    <span className="feature-badge">NEW</span>
                </Link>
                <Link href="/domains" className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3>로봇기술 도메인</h3>
                    <p>스마트 팩토리 로봇기술 핵심 도메인과 관련 스킬 살펴보기</p>
                </Link>
                <Link href="/compare" className="feature-card">
                    <div className="feature-icon">🔗</div>
                    <h3>로봇기술 비교</h3>
                    <p>도메인 간 스킬 중복과 공정 적용 특성 시각화</p>
                </Link>
                <Link href="/analytics" className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>기술 분석</h3>
                    <p>로봇기술 스킬 분포와 난이도/숙련도 인사이트</p>
                </Link>
                <Link href="/network" className="feature-card">
                    <div className="feature-icon">🚀</div>
                    <h3>기술 네트워크</h3>
                    <p>로봇기술 스킬 간 관계를 인터랙티브하게 시각화</p>
                </Link>
                <Link href="/organizations" className="feature-card" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, #FF6B6B22 0%, #FFA50022 100%)', border: '2px solid #FF6B6B' }}>
                    <div className="feature-icon">🏢</div>
                    <h3>Factory Robotics 매핑</h3>
                    <p>조직별 핵심 과제(Enabler)와 필요 역량(Skills) 탐색</p>
                </Link>
            </div>
        </main>
    )
}
