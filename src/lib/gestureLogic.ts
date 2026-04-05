import { Results } from '@mediapipe/hands';

export type GestureType = 'Click' | 'Swipe Left' | 'Swipe Right' | 'Laser' | 'None';

// History for swipe detection
let xHistory: number[] = [];
const HISTORY_SIZE = 10;

export function detectGesture(results: Results): { gesture: GestureType; confidence: number } {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    xHistory = [];
    return { gesture: 'None', confidence: 0 };
  }

  const landmarks = results.multiHandLandmarks[0];
  
  // Helper to check if finger is fully extended
  const isFingerExtended = (tip: number, pip: number, mcp: number) => {
    return landmarks[tip].y < landmarks[pip].y && landmarks[pip].y < landmarks[mcp].y;
  };

  const indexUp = isFingerExtended(8, 6, 5);
  const middleUp = isFingerExtended(12, 10, 9);
  const ringUp = isFingerExtended(16, 14, 13);
  const pinkyUp = isFingerExtended(20, 18, 17);
  
  // Track X position for swipe
  const palmCenter = landmarks[9]; // Middle finger MCP
  xHistory.push(palmCenter.x);
  if (xHistory.length > HISTORY_SIZE) xHistory.shift();

  // 1. Swipe Detection (All fingers up + movement)
  if (indexUp && middleUp && ringUp && pinkyUp && xHistory.length === HISTORY_SIZE) {
    const deltaX = xHistory[xHistory.length - 1] - xHistory[0];
    if (deltaX > 0.15) {
      xHistory = []; // Reset after detection
      return { gesture: 'Swipe Left', confidence: 0.92 }; // Mirrored
    } else if (deltaX < -0.15) {
      xHistory = [];
      return { gesture: 'Swipe Right', confidence: 0.92 };
    }
  }

  // 2. Click (Index and Thumb close)
  const distThumbIndex = Math.sqrt(
    Math.pow(landmarks[4].x - landmarks[8].x, 2) +
    Math.pow(landmarks[4].y - landmarks[8].y, 2)
  );
  
  if (distThumbIndex < 0.04 && indexUp) {
    return { gesture: 'Click', confidence: 0.98 };
  }

  // 3. Laser (Index finger up - primary pointing gesture)
  if (indexUp && !middleUp && !ringUp && !pinkyUp) {
    return { gesture: 'Laser', confidence: 0.95 };
  }

  // 4. Laser Fallback (All fingers up but no swipe)
  if (indexUp && middleUp && ringUp && pinkyUp) {
    return { gesture: 'Laser', confidence: 0.85 };
  }

  return { gesture: 'None', confidence: 0.5 };
}
