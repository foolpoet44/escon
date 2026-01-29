import Link from 'next/link';

export default function Home() {
    return (
        <main className="main-container">
            <div className="hero-section">
                <h1 className="hero-title">
                    ESCO Skills Ontology
                </h1>
                <p className="hero-subtitle">
                    Interactive visualization of digital skills and competencies
                </p>
                <div className="hero-description">
                    <p>
                        Explore the European Skills, Competences, Qualifications and Occupations (ESCO)
                        classification system with an intuitive, interactive interface.
                    </p>
                </div>
                <div className="cta-buttons">
                    <Link href="/domains" className="btn-primary">
                        Explore Skills
                    </Link>
                    <Link href="/visualization" className="btn-secondary">
                        View Documentation
                    </Link>
                </div>
            </div>

            <div className="features-grid">
                <Link href="/domains" className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3>Digital Skills</h3>
                    <p>Browse and explore digital competencies mapped to the ESCO framework</p>
                </Link>
                <Link href="/visualization" className="feature-card">
                    <div className="feature-icon">🔗</div>
                    <h3>Relationships</h3>
                    <p>Visualize connections between skills, occupations, and qualifications</p>
                </Link>
                <Link href="/analytics" className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>Analytics</h3>
                    <p>Gain insights from skill trends and competency distributions</p>
                </Link>
                <Link href="/skills" className="feature-card">
                    <div className="feature-icon">🚀</div>
                    <h3>Fast Prototype</h3>
                    <p>Quick and intuitive demonstration of core functionalities</p>
                </Link>
            </div>
        </main>
    )
}
