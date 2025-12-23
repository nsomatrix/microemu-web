# MicroEmulator Web UI Upgrade

I have upgraded the MicroEmulator Web interface to a modern, responsive, and premium design.

## Key Features

1.  **Modern Aesthetic**:
    -   **Dark Theme**: A deep blue/slate background (`#0f172a`) with a subtle radial gradient.
    -   **Glassmorphism**: Panels use a semi-transparent, blurred background effect for a sleek look.
    -   **Typography**: Used 'Inter' (system-ui fallback) for clean, modern text.
    -   **Gradients**: The title uses a text gradient for a pop of color.

2.  **Responsive Design**:
    -   **Mobile-First**: The layout adapts to smaller screens.
    -   **Flexible Container**: The emulator canvas is contained within a responsive wrapper that scales down on smaller devices while maintaining aspect ratio.
    -   **Media Queries**: Specific adjustments for mobile devices (padding, font sizes).

3.  **Enhanced User Experience**:
    -   **Loading State**: A dedicated loading overlay with a spinner and status text provides feedback while CheerpJ initializes.
    -   **Fullscreen Mode**: Added a "Fullscreen" button to immerse the user in the emulation experience.
    -   **Status Indicators**: A status badge in the header keeps the user informed of the system state.

## Files Modified

-   `app/src/index.css`: Global styles and theme variables.
-   `app/src/components/MicroEmulator.jsx`: Updated component structure and logic.
-   `app/src/components/MicroEmulator.css`: New component-specific styles.

## How to Run

The development server is already running. You can view the app at:
`http://localhost:5174/`
