import { Hands, Results } from '@mediapipe/hands';
import * as drawingUtils from '@mediapipe/drawing_utils';

export class HandTracker {
  private hands: Hands;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.hands = new Hands({
      locateFile: (file) => {
        // Use a specific version to match package.json and ensure stability
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
      },
    });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });
  }

  setCallback(onResults: (results: Results) => void) {
    this.hands.onResults(onResults);
  }

  private isProcessing = false;
  private isClosed = false;

  async send(image: HTMLVideoElement | HTMLCanvasElement) {
    if (this.isProcessing || this.isClosed) return;
    
    // Safety check: Ensure video is ready and has dimensions
    if (image instanceof HTMLVideoElement) {
      if (image.readyState < 2 || image.videoWidth === 0 || image.videoHeight === 0) return;
    } else if (image instanceof HTMLCanvasElement) {
      if (image.width === 0 || image.height === 0) return;
    }

    this.isProcessing = true;
    try {
      await this.hands.send({ image });
    } catch (error) {
      console.error("MediaPipe send error:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  async close() {
    if (this.isClosed) return;
    this.isClosed = true;
    try {
      await this.hands.close();
    } catch (error) {
      console.error("Error closing MediaPipe:", error);
    }
  }

  draw(ctx: CanvasRenderingContext2D, results: Results) {
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawingUtils.drawConnectors(ctx, landmarks, [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]], { color: '#00FF00', lineWidth: 5 });
        drawingUtils.drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 2 });
      }
    }
    ctx.restore();
  }
}
