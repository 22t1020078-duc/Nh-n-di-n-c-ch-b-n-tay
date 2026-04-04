# Hand Gesture Mouse Control 🖐️

A high-performance virtual mouse and presentation controller using hand gestures and MediaPipe.

## Features
- **Mouse Control:** Move cursor with index finger, click with pinch.
- **Presentation:** Swipe left/right to navigate slides.
- **Laser Pointer:** Virtual laser trail for highlighting content.
- **Zoom & Pause:** Pinch to zoom, fist to pause.
- **Real-time Stats:** FPS and confidence monitoring.

## Tech Stack
- **React 18+**
- **TypeScript**
- **MediaPipe Hands:** Real-time hand landmark detection.
- **Tailwind CSS:** Modern, responsive UI.
- **Motion:** Smooth animations and transitions.
- **Recharts:** Data visualization for system evaluation.

## How to Run
1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Architecture
- `src/lib/handTracker.ts`: Wrapper for MediaPipe Hands SDK.
- `src/lib/gestureLogic.ts`: Heuristic-based gesture recognition.
- `src/App.tsx`: Main application with routing and UI components.
