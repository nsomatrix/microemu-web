import React, { useEffect, useRef, useState } from 'react';
import './MicroEmulator.css';

const MicroEmulator = () => {
    const [status, setStatus] = useState('Booting System...');
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initCheerpJ = async () => {
            // Filter out known annoying errors
            const originalConsoleError = console.error;
            console.error = (...args) => {
                const msg = args[0]?.toString() || '';
                if (msg.includes("SecurityError") && msg.includes("iframe")) return;
                if (msg.includes("metrics.leaningtech.com")) return;
                if (msg.includes("net::ERR_CERT_COMMON_NAME_INVALID")) return;
                originalConsoleError.apply(console, args);
            };

            try {
                if (!window.cheerpjInit) {
                    setStatus('Connection Error: CheerpJ not found.');
                    return;
                }

                setStatus('Initializing Virtual Environment...');

                await window.cheerpjInit({
                    preloadResources: ["/microemulator.jar"],
                    javaProperties: {
                        "user.home": "/files/",
                        "user.dir": "/files/",
                        "microemulator.config.dir": "/files/.microemulator"
                    },
                    disableAnalytics: true,
                    enableAnalytics: false,
                    disableErrorReporting: true
                });

                setStatus('Loading MicroEmulator...');

                const display = document.getElementById('cheerpjDisplay');
                if (display) {
                    // Create display with a standard resolution
                    // The CSS will handle the scaling
                    window.cheerpjCreateDisplay(800, 600, display);
                }

                await window.cheerpjRunJar("/app/microemulator.jar");

                setStatus('System Ready');
                setLoading(false);
            } catch (error) {
                console.error("CheerpJ Error:", error);
                setStatus(`System Error: ${error.message}`);
                setLoading(false);
            }
        };

        if (window.cheerpjInit) {
            initCheerpJ();
        } else {
            const interval = setInterval(() => {
                if (window.cheerpjInit) {
                    clearInterval(interval);
                    initCheerpJ();
                }
            }, 100);
        }
    }, []);

    const toggleFullscreen = () => {
        const elem = document.getElementById('cheerpjDisplay');
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="app-container">
            <header className="header glass-panel">
                <div className="brand">MicroEmu Web</div>
                <div className="status-badge">{status}</div>
            </header>

            <main className="main-content">
                <div className="emulator-wrapper glass-panel">
                    {loading && (
                        <div className="loading-overlay">
                            <div className="spinner"></div>
                            <p>{status}</p>
                        </div>
                    )}
                    <div id="cheerpjDisplay"></div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <button onClick={toggleFullscreen} className="btn-primary">
                        Fullscreen
                    </button>
                </div>
            </main>

            <footer className="footer">
                <p>Powered by CheerpJ • Running J2ME in Browser</p>
            </footer>
        </div>
    );
};

export default MicroEmulator;
