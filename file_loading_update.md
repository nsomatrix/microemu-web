# MicroEmulator Web - File Loading Update

I have updated the application to support loading local JAR/JAD files and improved the startup stability.

## New Features

1.  **Local File Loading**:
    -   Added a **Start Screen** that appears before the emulator boots.
    -   You can now click **"Select JAR/JAD File"** to pick a game from your computer.
    -   The file is securely passed to the emulator using a Blob URL, bypassing the browser sandbox restrictions.

2.  **Improved Startup Flow**:
    -   **No Auto-Start**: The emulator no longer starts automatically, preventing the "freeze" sensation if it takes time to load.
    -   **Visual Feedback**: Clear "Initializing", "Booting", and "Running" states with a spinner.
    -   **Error Handling**: Better error messages and a "Reload" button if CheerpJ fails to initialize.

3.  **UI Refinements**:
    -   Added a **"Reset"** button to the running state to easily restart and pick a new game.
    -   Added a secondary button style for the file picker.

## How to Use

1.  Refresh the page at `http://localhost:5174/`.
2.  You will see the "Welcome" screen.
3.  **Option A**: Click "Select JAR/JAD File", pick your game, then click "Start with Selected File".
4.  **Option B**: Click "Start Emulator Empty" to run MicroEmulator without a game (you can try to load one from inside, but the local file picker is recommended).

## Technical Details

-   **Sandboxing Solution**: We use `URL.createObjectURL(file)` to create a temporary URL for your local file. This URL is passed as a command-line argument to MicroEmulator (`cheerpjRunJar("/app/microemulator.jar", blobUrl)`).
-   **State Management**: The app now uses a finite state machine (`initial` -> `starting` -> `running`) to manage the CheerpJ lifecycle.
