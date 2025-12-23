# MicroEmulator Web - Crash Fix

I have fixed the crash that occurred when trying to load a local JAR file.

## The Problem
The previous method used a "Blob URL" (e.g., `blob:http://...`) to pass the file to MicroEmulator. However, the Java environment inside CheerpJ does not support the `blob:` protocol, causing a `MalformedURLException` crash.

## The Solution
I have implemented a proper file injection mechanism using CheerpJ's virtual filesystem API.

1.  **Read File**: When you select a file, the browser reads it into memory as a byte array (`Uint8Array`).
2.  **Write to Virtual FS**: We use `cheerpOSAddStringFile` (or `cheerpjAddStringFile`) to write this byte array to a virtual path: `/str/game.jar`.
3.  **Run from Virtual FS**: We tell MicroEmulator to load the game from `/str/game.jar`, which is a valid path that the emulator understands.

## How to Verify
1.  Refresh the page at `http://localhost:5174/`.
2.  Select a JAR file.
3.  Click "Start".
4.  The game should now load correctly without crashing.

## Technical Note
This method requires the CheerpJ runtime to expose the file writing API. If you see an error "File writing API not found", it means the version of CheerpJ being used is too old or configured differently, but the code includes a fallback check.
