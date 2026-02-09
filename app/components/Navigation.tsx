'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/organizations', label: '조직', icon: '🏢' },
  { href: '/domains', label: '도메인', icon: '📂' },
  { href: '/search', label: '검색', icon: '🔍' },
  { href: '/skills', label: '스킬', icon: '⚡' },
  { href: '/compare', label: '비교', icon: '⚖️' },
  { href: '/network', label: '네트워크', icon: '🕸️' },
  { href: '/tree', label: '트리', icon: '🌳' },
  { href: '/visualization', label: '시각화', icon: '📊' },
  { href: '/ai-match', label: 'AI 매칭', icon: '🤖' },
  { href: '/analytics', label: '분석', icon: '📈' }
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="navigation" aria-label="주요 메뉴">
      <div className="nav-container">
        <Link href="/" className="nav-logo" aria-label="홈으로">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">ESCO Skills</span>
        </Link>

        <div className="nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .navigation {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          backdrop-filter: blur(10px);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-md) var(--spacing-lg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-lg);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          transition: transform var(--transition-base);
        }

        .nav-logo:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          font-size: 2rem;
        }

        .logo-text {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          gap: var(--spacing-xs);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all var(--transition-base);
          position: relative;
        }

        .nav-link:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          transform: translateY(-2px);
        }

        .nav-link.active {
          background: var(--bg-tertiary);
          color: var(--color-primary);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: var(--spacing-md);
          right: var(--spacing-md);
          height: 2px;
          background: var(--color-primary);
          border-radius: 2px;
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .nav-links {
            width: 100%;
            overflow-x: auto;
            justify-content: flex-start;
            padding-bottom: var(--spacing-xs);
          }

          .nav-label {
            display: none;
          }

          .nav-link {
            padding: var(--spacing-sm);
          }
        }
      `}</style>
    </nav>
  );
}
