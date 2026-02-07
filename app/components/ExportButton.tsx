"use client";

import { Skill } from '../lib/types';
import { exportToCSV, exportToJSON, getDateString } from '../lib/export';
import { useState } from 'react';

interface ExportButtonProps {
  skills: Skill[];
  filename?: string;
  label?: string;
  variant?: 'primary' | 'secondary';
}

export default function ExportButton({
  skills,
  filename,
  label = '데이터 내보내기',
  variant = 'secondary'
}: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const dateStr = getDateString();
  const baseFilename = filename || `skills_${dateStr}`;

  const handleExportCSV = () => {
    exportToCSV(skills, `${baseFilename}.csv`);
    setShowMenu(false);
  };

  const handleExportJSON = () => {
    exportToJSON(skills, `${baseFilename}.json`);
    setShowMenu(false);
  };

  return (
    <div className="export-button-container">
      <button
        className={`export-button ${variant}`}
        onClick={() => setShowMenu(!showMenu)}
      >
        <span className="export-icon">📥</span>
        <span>{label}</span>
        <span className="export-arrow">{showMenu ? '▲' : '▼'}</span>
      </button>

      {showMenu && (
        <div className="export-menu">
          <button className="export-menu-item" onClick={handleExportCSV}>
            <span className="menu-icon">📊</span>
            <div className="menu-content">
              <div className="menu-title">CSV로 내보내기</div>
              <div className="menu-desc">Excel 호환 형식</div>
            </div>
          </button>
          <button className="export-menu-item" onClick={handleExportJSON}>
            <span className="menu-icon">📄</span>
            <div className="menu-content">
              <div className="menu-title">JSON으로 내보내기</div>
              <div className="menu-desc">개발자 친화적 형식</div>
            </div>
          </button>
          <div className="export-info">
            {skills.length}개 스킬을 내보냅니다
          </div>
        </div>
      )}

      <style jsx>{`
        .export-button-container {
          position: relative;
          display: inline-block;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          border: 2px solid var(--border-color);
        }

        .export-button.primary {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .export-button.primary:hover {
          background: var(--color-secondary);
          border-color: var(--color-secondary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .export-button.secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: var(--border-color);
        }

        .export-button.secondary:hover {
          background: var(--bg-secondary);
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .export-icon {
          font-size: 1.2rem;
        }

        .export-arrow {
          font-size: 0.8rem;
          margin-left: var(--spacing-xs);
        }

        .export-menu {
          position: absolute;
          top: calc(100% + var(--spacing-xs));
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          min-width: 280px;
          z-index: 100;
          overflow: hidden;
        }

        .export-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md) var(--spacing-lg);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .export-menu-item:last-of-type {
          border-bottom: none;
        }

        .export-menu-item:hover {
          background: var(--bg-tertiary);
        }

        .menu-icon {
          font-size: 1.5rem;
        }

        .menu-content {
          flex-grow: 1;
        }

        .menu-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .menu-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .export-info {
          padding: var(--spacing-sm) var(--spacing-lg);
          background: var(--bg-tertiary);
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: center;
          border-top: 1px solid var(--border-color);
        }

        @media (max-width: 768px) {
          .export-menu {
            right: auto;
            left: 0;
          }
        }
      `}</style>
    </div>
  );
}
