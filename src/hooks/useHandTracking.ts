import { useEffect, useRef, useState } from 'react';
import { detectPinch } from '../utils/gestureDetection';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

export interface HandState {
  isOpen: boolean;
  openness: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isDetected: boolean;
  isPinching: boolean;
  landmarks?: any[];
}

export interface HandTrackingData {
  leftHand: HandState;
  rightHand: HandState;
  isInitialized: boolean;
}

const calculateHandOpenness = (landmarks: any[]): number => {
  const fingerTips = [8, 12, 16, 20];
  const fingerBases = [5, 9, 13, 17];
  const palmCenter = landmarks[0];

  let totalDistance = 0;
  let baseDistance = 0;

  fingerTips.forEach((tipIndex, i) => {
    const tip = landmarks[tipIndex];
    const base = landmarks[fingerBases[i]];

    const tipDist = Math.sqrt(
      Math.pow(tip.x - palmCenter.x, 2) +
      Math.pow(tip.y - palmCenter.y, 2) +
      Math.pow(tip.z - palmCenter.z, 2)
    );

    const baseDist = Math.sqrt(
      Math.pow(base.x - palmCenter.x, 2) +
      Math.pow(base.y - palmCenter.y, 2) +
      Math.pow(base.z - palmCenter.z, 2)
    );

    totalDistance += tipDist;
    baseDistance += baseDist;
  });

  const thumbTip = landmarks[4];
  const thumbDist = Math.sqrt(
    Math.pow(thumbTip.x - palmCenter.x, 2) +
    Math.pow(thumbTip.y - palmCenter.y, 2) +
    Math.pow(thumbTip.z - palmCenter.z, 2)
  );
  totalDistance += thumbDist;

  const openness = Math.min(1, Math.max(0, (totalDistance / 2.5) - 0.3));
  return openness;
};

const getHandPosition = (landmarks: any[]) => {
  const wrist = landmarks[0];
  return {
    x: (wrist.x - 0.5) * 2,
    y: -(wrist.y - 0.5) * 2,
    z: wrist.z * -2
  };
};

const getWristRotation = (landmarks: any[]) => {
  const wrist = landmarks[0];
  const indexMCP = landmarks[5];
  const pinkyMCP = landmarks[17];

  const handVector = {
    x: indexMCP.x - pinkyMCP.x,
    y: indexMCP.y - pinkyMCP.y,
    z: indexMCP.z - pinkyMCP.z
  };

  const middleFinger = landmarks[9];
  const forwardVector = {
    x: middleFinger.x - wrist.x,
    y: middleFinger.y - wrist.y,
    z: middleFinger.z - wrist.z
  };

  const rotZ = Math.atan2(handVector.y, handVector.x);
  const rotX = Math.atan2(forwardVector.y, Math.sqrt(forwardVector.x * forwardVector.x + forwardVector.z * forwardVector.z));
  const rotY = Math.atan2(-forwardVector.x, -forwardVector.z);

  return {
    x: rotX,
    y: rotY,
    z: rotZ
  };
};

export const useHandTracking = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const initializingRef = useRef(false);

  const [handData, setHandData] = useState<HandTrackingData>({
    leftHand: { isOpen: false, openness: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, isDetected: false, isPinching: false },
    rightHand: { isOpen: false, openness: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, isDetected: false, isPinching: false },
    isInitialized: false
  });

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    const initializeMediaPipe = () => {
      if (!window.Hands || !window.Camera) {
        console.log('MediaPipe not loaded yet, retrying...');
        setTimeout(initializeMediaPipe, 100);
        return;
      }

      console.log('MediaPipe loaded, initializing...');

      const videoElement = document.createElement('video');
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);
      videoRef.current = videoElement;

      let hands: any;
      try {
        hands = new window.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.3,
          minTrackingConfidence: 0.3
        });

        hands.onResults((results: any) => {
          console.log('Hand detection results:', {
            hasFaces: !!results.multiHandLandmarks,
            handsDetected: results.multiHandLandmarks?.length || 0
          });

          const newLeftHand: HandState = {
            isOpen: false,
            openness: 0,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            isDetected: false,
            isPinching: false
          };

          const newRightHand: HandState = {
            isOpen: false,
            openness: 0,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            isDetected: false,
            isPinching: false
          };

          if (results.multiHandLandmarks && results.multiHandedness) {
            results.multiHandLandmarks.forEach((landmarks: any, index: number) => {
              const handedness = results.multiHandedness[index].label;
              const openness = calculateHandOpenness(landmarks);
              const position = getHandPosition(landmarks);
              const rotation = getWristRotation(landmarks);
              const isPinching = detectPinch(landmarks);

              const handState: HandState = {
                isOpen: openness > 0.5,
                openness,
                position,
                rotation,
                isDetected: true,
                isPinching,
                landmarks
              };

              if (handedness === 'Left') {
                Object.assign(newRightHand, handState);
              } else {
                Object.assign(newLeftHand, handState);
              }
            });
          }

          setHandData({
            leftHand: newLeftHand,
            rightHand: newRightHand,
            isInitialized: true
          });
        });

        handsRef.current = hands;

        let frameCount = 0;
        const camera = new window.Camera(videoElement, {
          onFrame: async () => {
            frameCount++;
            if (frameCount % 30 === 0) {
              console.log('Camera frames processed:', frameCount);
            }
            if (handsRef.current) {
              await handsRef.current.send({ image: videoElement });
            }
          },
          width: 640,
          height: 480
        });

        camera.start()
          .then(() => {
            console.log('Camera started successfully');
          })
          .catch((err: any) => {
            console.error('Camera initialization failed:', err);
            setHandData(prev => ({ ...prev, isInitialized: true }));
          });

        cameraRef.current = camera;
      } catch (error) {
        console.error('Failed to initialize MediaPipe Hands:', error);
        setHandData(prev => ({ ...prev, isInitialized: true }));
      }
    };

    initializeMediaPipe();

    return () => {
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.error('Error stopping camera:', e);
        }
      }
      if (handsRef.current) {
        try {
          handsRef.current.close?.();
        } catch (e) {
          console.error('Error closing hands:', e);
        }
      }
      if (videoRef.current && document.body.contains(videoRef.current)) {
        document.body.removeChild(videoRef.current);
      }
    };
  }, []);

  return { handData, videoElement: videoRef.current };
};
