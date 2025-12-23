import React, { useEffect, useRef, useState } from 'react';
import './MicroEmulator.css';

const MicroEmulator = () => {
    const [status, setStatus] = useState('Ready');
    const [appState, setAppState] = useState('initial'); // initial, starting, running, error
    const [midletFile, setMidletFile] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState('default');
    const initialized = useRef(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setMidletFile(file);
            setStatus(`Selected: ${file.name}`);
        }
    };

    const startEmulator = async () => {
        if (initialized.current) return;
        setAppState('starting');
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
                    throw new Error('CheerpJ loader not found. Check your internet connection.');
                }

                setStatus('Initializing Virtual Environment...');
                console.log('Calling cheerpjInit...');

                await window.cheerpjInit({
                    preloadResources: ["/microemulator.jar"],
                    javaProperties: {
                        "user.home": "/files/",
                        "user.dir": "/files/",
                        // Point config to root /files/ to ensure it exists and is writable
                        "microemulator.config.dir": "/files/",
                    },
                    disableAnalytics: true,
                    enableAnalytics: false,
                    disableErrorReporting: true
                });

                // Write the selected file to the virtual filesystem
                if (midletFile) {
                    setStatus('Loading Game File...');
                    console.log('Reading local file...');

                    const arrayBuffer = await midletFile.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);

                    // Use cheerpOSAddStringFile to write to /str/ mount point
                    // This is the correct way to inject files in CheerpJ 2.3/3.0
                    // Note: The function name might vary slightly between versions,
                    // but cheerpOSAddStringFile is the standard for recent ones.
                    // If it's missing, we might need a fallback or check window.cheerpjAddStringFile
                    const writeFunc = window.cheerpOSAddStringFile || window.cheerpjAddStringFile;

                    if (writeFunc) {
                        console.log('Writing file to virtual FS: /str/game.jar');
                        writeFunc("/str/game.jar", uint8Array);
                    } else {
                        throw new Error("File writing API not found in CheerpJ.");
                    }
                }

                setStatus('Configuring Display...');
                const display = document.getElementById('cheerpjDisplay');
                if (display) {
                    // Create display with a standard resolution
                    console.log('Creating CheerpJ Display...');
                    window.cheerpjCreateDisplay(800, 600, display);
                } else {
                    console.warn('Display element not found during init!');
                }

                setStatus('Booting MicroEmulator (Browser may freeze briefly)...');
                console.log('Running MicroEmulator JAR...');

                // Prepare arguments
                const args = [];

                // Add Device Argument if not default
                if (selectedDevice === 'resizable') {
                    args.push('--device', 'org/microemu/device/resizable/device.xml');
                } else if (selectedDevice === 'large') {
                    args.push('--device', 'org/microemu/device/large/device.xml');
                }

                // Add Midlet File Argument
                if (midletFile) {
                    // Point to the file in the virtual filesystem
                    args.push('/str/game.jar');
                }

                // Run the JAR with arguments
                // Note: cheerpjRunJar(url, arg1, arg2...)
                await window.cheerpjRunJar("/app/microemulator.jar", ...args);

                setStatus('System Ready');
                setAppState('running');
                console.log('MicroEmulator started successfully.');

            } catch (error) {
                console.error("CheerpJ Error:", error);
                setStatus(`System Error: ${error.message}`);
                setAppState('error');
                initialized.current = false; // Allow retry
            }
        };

        // Give the script a moment to load if it hasn't already
        if (window.cheerpjInit) {
            initCheerpJ();
        } else {
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (window.cheerpjInit) {
                    clearInterval(interval);
                    initCheerpJ();
                } else if (attempts > 50) { // 5 seconds timeout
                    clearInterval(interval);
                    setStatus('Error: CheerpJ script failed to load.');
                    setAppState('error');
                }
            }, 100);
        }
    };

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

    const resetEmulator = () => {
        window.location.reload();
    };

    return (
        <div className="app-container">
            <header className="header glass-panel">
                <div className="brand">MicroEmu Web</div>
                <div className="status-badge">{status}</div>
            </header>

            <main className="main-content">
                <div className="emulator-wrapper glass-panel">

                    {/* Initial State: File Picker and Start Button */}
                    {appState === 'initial' && (
                        <div className="loading-overlay">
                            <h2>Welcome</h2>
                            <p style={{ marginBottom: '1.5rem', textAlign: 'center', maxWidth: '400px' }}>
                                Select a J2ME MIDlet (.jar) or JAD file to run.
                            </p>

                            <input
                                type="file"
                                accept=".jar,.jad"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />

                            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', width: '100%', maxWidth: '300px' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {midletFile ? `Change File (${midletFile.name})` : 'Select JAR/JAD File'}
                                </button>

                                <div className="device-selector">
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                                        Select Device Skin:
                                    </label>
                                    <select
                                        value={selectedDevice}
                                        onChange={(e) => setSelectedDevice(e.target.value)}
                                        className="select-input"
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: 'white',
                                            border: '1px solid var(--glass-border)',
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        <option value="default">Default Device</option>
                                        <option value="resizable">Resizable Device</option>
                                        <option value="large">Large Device</option>
                                    </select>
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={startEmulator}
                                >
                                    {midletFile ? 'Start with Selected File' : 'Start Emulator Empty'}
                                </button>
                            </div>

                            <div className="warning-box" style={{
                                marginTop: '1.5rem',
                                padding: '0.75rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                color: '#fca5a5',
                                maxWidth: '300px',
                                textAlign: 'center'
                            }}>
                                ⚠️ <strong>Note:</strong> Do not use the "Options" menu inside the emulator, as it may freeze the browser due to sandbox limitations. Use the dropdown above to select a device.
                            </div>
                        </div>
                    )}

                    {/* Starting State: Spinner */}
                    {appState === 'starting' && (
                        <div className="loading-overlay">
                            <div className="spinner"></div>
                            <p>{status}</p>
                        </div>
                    )}

                    {/* Error State */}
                    {appState === 'error' && (
                        <div className="loading-overlay">
                            <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{status}</p>
                            <button className="btn-primary" onClick={resetEmulator}>
                                Reload Page
                            </button>
                        </div>
                    )}

                    {/* The Display Canvas - Always present but hidden when not running to keep DOM stable if needed,
                        but CheerpJ needs it during init. So we keep it in DOM. */}
                    <div id="cheerpjDisplay" style={{ display: appState === 'initial' ? 'none' : 'flex' }}></div>
                </div>

                {appState === 'running' && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <button onClick={toggleFullscreen} className="btn-primary">
                            Fullscreen
                        </button>
                        <button onClick={resetEmulator} className="btn-secondary">
                            Reset
                        </button>
                    </div>
                )}
            </main>

            <footer className="footer">
                <p>Powered by CheerpJ • Running J2ME in Browser</p>
            </footer>
        </div>
    );
};

export default MicroEmulator;
