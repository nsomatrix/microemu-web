# MicroEmulator Web - Device Selection Update

I have updated the application to address the "Options" menu freeze and provide a better way to configure the emulator.

## The Issue
The "Options" menu in MicroEmulator uses Java AWT Modal Dialogs. In a browser environment (CheerpJ), these dialogs can cause the main thread to freeze because the browser cannot "pause" execution like a native JVM can.

## The Solution
Instead of fixing the broken "Options" menu (which is a deep engine limitation), I have moved the configuration **outside** the emulator into the React UI.

## New Features

1.  **Device Skin Selector**:
    -   Added a dropdown menu to the Start Screen.
    -   **Default Device**: The standard MicroEmulator skin.
    -   **Resizable Device**: A generic skin that allows for different screen sizes (passed via `--device org/microemu/device/resizable/device.xml`).
    -   **Large Device**: A larger default skin.

2.  **Configuration Fixes**:
    -   Changed the configuration directory to `/files/` (the virtual root) to ensure MicroEmulator can write its config file without crashing, which might have contributed to instability.

3.  **User Guidance**:
    -   Added a clear **Warning Message** advising users NOT to use the "Options" menu to prevent freezes.

## How to Use

1.  Refresh the page at `http://localhost:5174/`.
2.  Select your JAR file.
3.  **Select your desired Device Skin** from the dropdown (e.g., "Resizable Device").
4.  Click "Start".

The emulator will launch with the selected device skin pre-loaded, removing the need to access the "Options" menu.
