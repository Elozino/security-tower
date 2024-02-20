import { RefObject } from "react";
import Webcam from "react-webcam";
import { DetectedObject } from "@tensorflow-models/coco-ssd";

export function resizeCanvas(
  canvasRef: RefObject<HTMLCanvasElement>,
  webcamRef: RefObject<Webcam>
) {
  const canvas = canvasRef.current;
  const video = webcamRef.current?.video;

  if (canvas && video) {
    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
  }
}

export function drawOnCanvas(
  mirrored: boolean,
  predictions: DetectedObject[],
  ctx: CanvasRenderingContext2D | null | undefined
) {
  predictions.forEach((detectedObject: DetectedObject) => {
    const { class: name, bbox, score } = detectedObject;
    const [x, y, width, height] = bbox;

    if (ctx) {
      ctx.beginPath();

      // styling
      ctx.fillStyle = name === "person" ? "#FF0F0F" : "#00B612";
      ctx.globalAlpha = 0.4;

      mirrored
        ? ctx.roundRect(ctx.canvas.width - x, y, -width, height, 8)
        : ctx.roundRect(x, y, width, height, 8);

      // draw stroke or fill
      ctx.fill();

      // text styling
      ctx.font = "12px Courier New";
      ctx.fillStyle = 'black'
      ctx.globalAlpha = 1;
      mirrored
        ? ctx.fillText(name, ctx.canvas.width - x -width + 10, y + 20)
        : ctx.fillText(name, x + 10 , y + 20);
    }
  });
}
