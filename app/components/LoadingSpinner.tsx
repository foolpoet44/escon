'use client';

export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">{text}</p>
            <style jsx>{`
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    height: 100%;
                    min-height: 200px;
                }
                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid rgba(78, 205, 196, 0.1);
                    border-radius: 50%;
                    border-left-color: #4ECDC4;
                    animation: spin 1s ease infinite;
                }
                .loading-text {
                    margin-top: 1rem;
                    color: #64748b;
                    font-size: 0.95rem;
                    font-weight: 500;
                    animation: pulse 1.5s ease-in-out infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
