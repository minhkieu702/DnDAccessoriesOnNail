import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Hands } from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";

const VirtualTryOn = ({ nailDesign }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (!isCameraReady) return;

    async function setupHands() {
      console.log("Initializing MediaPipe Hands...");
    
      const hands = new Hands({
        locateFile: (file) => `https://www.gstatic.com/mediapipe/hands/${file}`,
      });
    
      hands.setOptions({
        maxNumHands: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });
    
      hands.onResults(onResults);
      console.log("onResults function assigned");
    
      let retries = 10;
      while (retries > 0 && (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4)) {
        console.log("Waiting for camera to be ready...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        retries--;
      }
    
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        console.log("Camera ready! Starting MediaPipe...");
        const camera = new cam.Camera(webcamRef.current.video, {
          onFrame: async () => {
            try {
              console.log("Sending frame to MediaPipe...");
              await hands.send({ image: webcamRef.current.video });
            } catch (error) {
              console.error("Error sending frame to MediaPipe:", error);
            }
          },
          width: 640,
          height: 480,
        });
        camera.start();
      } else {
        console.error("Camera not ready after retries.");
      }
    }
    

    setupHands();
  }, [isCameraReady]);

  const onResults = (results) => {
    console.log("onResults called");
    if (!results || !canvasRef.current) {
      console.error("No results or canvas not found.");
      return;
    }

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
      console.log("Hand landmarks detected:", results.multiHandLandmarks);
      for (const landmarks of results.multiHandLandmarks) {
        const indexTip = landmarks[8]; // Ngón trỏ
        const x = indexTip.x * canvasElement.width;
        const y = indexTip.y * canvasElement.height;

        if (!nailDesign) {
          console.warn("No nail design available");
          return;
        }
        console.log("Nail design received:", nailDesign);

        const img = new Image();
        img.onload = () => {
          console.log("Nail design loaded, drawing on canvas...");
          canvasCtx.drawImage(img, x - 25, y - 25, 50, 50);
          canvasCtx.restore();
        };
        img.onerror = () => console.error("Failed to load nail design image:", nailDesign);
        img.src = nailDesign;
      }
    } else {
      console.warn("No hand detected.");
    }
  };

  return (
    <div style={{ position: "relative", width: 640, height: 480 }}>
      <Webcam
        ref={webcamRef}
        onUserMedia={() => {
          console.log("Webcam is now ready!");
          setIsCameraReady(true);
        }}
        videoConstraints={{
          facingMode: "user",
        }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      <canvas ref={canvasRef} width={640} height={480} style={{ position: "absolute", top: 0, left: 0 }} />
    </div>
  );
};

export default VirtualTryOn;
