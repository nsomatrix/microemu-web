import React, { useEffect, useRef, useState } from 'react';

const MicroEmulator = () => {
    const [status, setStatus] = useState('Loading CheerpJ...');
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const initCheerpJ = async () => {
            try {
                if (!window.cheerpjInit) {
                    setStatus('CheerpJ not found. Check internet connection.');
                    return;
                }

                setStatus('Initializing CheerpJ...');
                // Initialize CheerpJ with system properties
                // Using /files/ as home since it definitely exists in the virtual FS
                await window.cheerpjInit({
                    preloadResources: ["/app/microemulator.jar"],
                    javaProperties: {
                        "user.home": "/files/",
                        "user.dir": "/files/",
                        "microemulator.config.dir": "/files/.microemulator"
                    }
                });



                setStatus('Running MicroEmulator...');

                // Create the display element manually
                const display = document.getElementById('cheerpjDisplay');
                if (display) {
                    // window.cheerpjCreateDisplay(width, height, parentElement)
                    // MicroEmulator default size is usually small, maybe 800x600 is safe
                    window.cheerpjCreateDisplay(800, 600, display);
                }

                // Run the jar. 
                await window.cheerpjRunJar("/app/microemulator.jar", "");

                setStatus('MicroEmulator Running');
            } catch (error) {
                console.error("CheerpJ Error:", error);
                setStatus(`Error: ${error.message}`);
            }
        };

        // Give the script a moment to load if it hasn't already
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

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#282c34',
            color: 'white'
        }}>
            <h1 style={{ marginBottom: '20px' }}>MicroEmulator Web</h1>
            <p>{status}</p>
            <div id="cheerpjDisplay" style={{ width: '800px', height: '600px', background: 'black' }}></div>
        </div>
    );
};

export default MicroEmulator;
