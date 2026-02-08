'use client';

import { useState } from 'react';
import type { EnrichedSkill, Enabler } from '../lib/types';
import {
    exportEnrichedSkillsToCSV,
    exportEnablersToCSV,
    exportOrgStatsToCSV,
    exportToJSON,
} from '../lib/export';

interface OrgExportButtonProps {
    data: EnrichedSkill[] | Enabler[] | any;
    dataType: 'skills' | 'enablers' | 'stats';
    label?: string;
    filename?: string;
    variant?: 'primary' | 'secondary';
}

export default function OrgExportButton({
    data,
    dataType,
    label,
    filename,
    variant = 'secondary',
}: OrgExportButtonProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportCSV = () => {
        setIsExporting(true);
        try {
            switch (dataType) {
                case 'skills':
                    exportEnrichedSkillsToCSV(data as EnrichedSkill[], filename);
                    break;
                case 'enablers':
                    exportEnablersToCSV(data as Enabler[], filename);
                    break;
                case 'stats':
                    exportOrgStatsToCSV(data, filename);
                    break;
            }
            setTimeout(() => {
                setIsExporting(false);
                setShowMenu(false);
            }, 1000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const handleExportJSON = () => {
        setIsExporting(true);
        try {
            const jsonFilename = filename?.replace('.csv', '.json') || 'data.json';
            exportToJSON(data, jsonFilename);
            setTimeout(() => {
                setIsExporting(false);
                setShowMenu(false);
            }, 1000);
        } catch (error) {
            console.error('Export failed:', error);
            setIsExporting(false);
        }
    };

    const getLabel = () => {
        if (label) return label;
        switch (dataType) {
            case 'skills':
                return '스킬 데이터 내보내기';
            case 'enablers':
                return 'Enabler 데이터 내보내기';
            case 'stats':
                return '통계 데이터 내보내기';
            default:
                return '데이터 내보내기';
        }
    };

    const getDataCount = () => {
        if (Array.isArray(data)) {
            return `${data.length}개 항목`;
        }
        return '통계 데이터';
    };

    return (
        <div className="org-export-button-container">
            <button
                className={`org-export-button ${variant}`}
                onClick={() => setShowMenu(!showMenu)}
                disabled={isExporting}
            >
                <span className="export-icon">{isExporting ? '⏳' : '📥'}</span>
                <span>{isExporting ? '내보내는 중...' : getLabel()}</span>
                <span className="export-arrow">{showMenu ? '▲' : '▼'}</span>
            </button>

            {showMenu && !isExporting && (
                <div className="org-export-menu">
                    <button className="org-export-menu-item" onClick={handleExportCSV}>
                        <span className="menu-icon">📊</span>
                        <div className="menu-content">
                            <div className="menu-title">CSV로 내보내기</div>
                            <div className="menu-desc">Excel 호환 형식</div>
                        </div>
                    </button>
                    <button className="org-export-menu-item" onClick={handleExportJSON}>
                        <span className="menu-icon">📄</span>
                        <div className="menu-content">
                            <div className="menu-title">JSON으로 내보내기</div>
                            <div className="menu-desc">개발자 친화적 형식</div>
                        </div>
                    </button>
                    <div className="org-export-info">{getDataCount()}을 내보냅니다</div>
                </div>
            )}

            <style jsx>{`
                .org-export-button-container {
                    position: relative;
                    display: inline-block;
                }

                .org-export-button {
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

                .org-export-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .org-export-button.primary {
                    background: var(--color-primary);
                    color: white;
                    border-color: var(--color-primary);
                }

                .org-export-button.primary:hover:not(:disabled) {
                    background: var(--color-secondary);
                    border-color: var(--color-secondary);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }

                .org-export-button.secondary {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    border-color: var(--border-color);
                }

                .org-export-button.secondary:hover:not(:disabled) {
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

                .org-export-menu {
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

                .org-export-menu-item {
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

                .org-export-menu-item:last-of-type {
                    border-bottom: none;
                }

                .org-export-menu-item:hover {
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

                .org-export-info {
                    padding: var(--spacing-sm) var(--spacing-lg);
                    background: var(--bg-tertiary);
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    text-align: center;
                    border-top: 1px solid var(--border-color);
                }

                @media (max-width: 768px) {
                    .org-export-menu {
                        right: auto;
                        left: 0;
                    }
                }
            `}</style>
        </div>
    );
}
