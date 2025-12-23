import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HandTrackingData } from '../hooks/useHandTracking';

interface HandFeedbackRingsProps {
  handData: HandTrackingData;
  scene: THREE.Scene;
}

export const HandFeedbackRings = ({ handData, scene }: HandFeedbackRingsProps) => {
  const leftRingRef = useRef<THREE.Mesh | null>(null);
  const rightRingRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const dotGeometry = new THREE.SphereGeometry(0.03, 16, 16);

    const leftMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const leftRing = new THREE.Mesh(dotGeometry, leftMaterial);
    leftRingRef.current = leftRing;
    scene.add(leftRing);

    const rightMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const rightRing = new THREE.Mesh(dotGeometry, rightMaterial);
    rightRingRef.current = rightRing;
    scene.add(rightRing);

    return () => {
      scene.remove(leftRing);
      scene.remove(rightRing);
      dotGeometry.dispose();
      leftMaterial.dispose();
      rightMaterial.dispose();
    };
  }, [scene]);

  useEffect(() => {
    if (!leftRingRef.current || !rightRingRef.current) return;

    const leftRing = leftRingRef.current;
    const rightRing = rightRingRef.current;
    const leftMaterial = leftRing.material as THREE.MeshBasicMaterial;
    const rightMaterial = rightRing.material as THREE.MeshBasicMaterial;

    if (handData.leftHand.isDetected) {
      leftRing.position.set(
        handData.leftHand.position.x,
        handData.leftHand.position.y,
        handData.leftHand.position.z - 2
      );

      const time = Date.now() * 0.003;
      const baseOpacity = 0.3 + Math.sin(time) * 0.15;
      leftMaterial.opacity = baseOpacity;

      if (handData.leftHand.isPinching) {
        const pulseScale = 1.2 + Math.sin(time * 3) * 0.2;
        leftRing.scale.set(pulseScale, pulseScale, pulseScale);
        leftMaterial.color.setHex(0x00ffaa);
        leftMaterial.opacity = baseOpacity + 0.4;
      } else {
        leftRing.scale.set(1, 1, 1);
        leftMaterial.color.setHex(0x4a9eff);
      }
    } else {
      leftMaterial.opacity = 0;
    }

    if (handData.rightHand.isDetected) {
      rightRing.position.set(
        handData.rightHand.position.x,
        handData.rightHand.position.y,
        handData.rightHand.position.z - 2
      );

      const time = Date.now() * 0.003;
      const baseOpacity = 0.3 + Math.sin(time) * 0.15;
      rightMaterial.opacity = baseOpacity;

      const scaleFactor = 0.4 + handData.rightHand.openness * 0.5;
      rightRing.scale.set(scaleFactor, scaleFactor, scaleFactor);

      const colorLerp = handData.rightHand.openness;
      const color = new THREE.Color();
      color.lerpColors(
        new THREE.Color(0x4a9eff),
        new THREE.Color(0xff4a9e),
        colorLerp
      );
      rightMaterial.color.copy(color);
    } else {
      rightMaterial.opacity = 0;
    }
  }, [handData]);

  return null;
};
