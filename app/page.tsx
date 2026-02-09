import Link from 'next/link';

export default function Home() {
    return (
        <main className="main-container">
            <div className="hero-section">
                <h1 className="hero-title">
                    Physical AI skill Ontology
                </h1>
                <p className="hero-subtitle">
                    물리적 AI 도메인의 스킬과 역량 탐색
                </p>
                <div className="hero-description">
                    <p>
                        로보틱스, AI & ML, 제조 등 10개 도메인에 걸친 1,640개 이상의 스킬을
                        직관적이고 인터랙티브한 인터페이스로 탐색하세요.
                    </p>
                </div>
                <div className="cta-buttons">
                    <Link href="/domains" className="btn-primary">
                        탐색 시작
                    </Link>
                    <Link href="/organizations" className="btn-secondary">
                        조직 스킬 보기
                    </Link>
                    <Link href="/visualization" className="btn-secondary">
                        시각화 보기
                    </Link>
                </div>
            </div>

            <div className="features-grid">
                <Link href="/organizations" className="feature-card featured">
                    <div className="feature-icon">🏢</div>
                    <h3>조직 스킬 매칭</h3>
                    <p>로봇솔루션 등 조직별 Enabler와 스킬 매칭 시스템</p>
                    <span className="feature-badge">NEW</span>
                </Link>
                <Link href="/domains" className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3>도메인 탐색</h3>
                    <p>10개의 물리적 AI 도메인과 관련 스킬 살펴�기</p>
                </Link>
                <Link href="/compare" className="feature-card">
                    <div className="feature-icon">🔗</div>
                    <h3>도메인 비교</h3>
                    <p>도메인 간 스킬 중복과 고유 역량 시각화</p>
                </Link>
                <Link href="/analytics" className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>분석</h3>
                    <p>스킬 트렌드와 역량 분포에서 인사이트 도출</p>
                </Link>
                <Link href="/network" className="feature-card">
                    <div className="feature-icon">🚀</div>
                    <h3>네트워크 그래프</h3>
                    <p>스킬 간 관계를 인터랙티브하게 시각화</p>
                </Link>
            </div>
        </main>
    )
}
