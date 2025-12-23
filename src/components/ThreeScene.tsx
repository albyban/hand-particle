import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ParticleSystem } from './ParticleSystem';
import { particleTemplates } from '../utils/particleTemplates';
import { HandTrackingData } from '../hooks/useHandTracking';
import { HandFeedbackRings } from './HandFeedbackRings';
import { colorPresets } from '../utils/colorPresets';

interface ThreeSceneProps {
  handData: HandTrackingData;
  selectedTemplate: string;
  particleColor: string;
  onColorChange: (color: string) => void;
  bloomEnabled?: boolean;
  bloomIntensity?: number;
  particleSize?: number;
  particleOpacity?: number;
  pulsateIntensity?: number;
  autoRotateSpeed?: number;
  particleDensity?: number;
  backgroundColor?: string;
  showHandDots?: boolean;
}

export const ThreeScene = ({
  handData,
  selectedTemplate,
  particleColor,
  onColorChange,
  bloomEnabled = true,
  bloomIntensity = 1,
  particleSize = 0.03,
  particleOpacity = 0.8,
  pulsateIntensity = 0,
  autoRotateSpeed = 0,
  particleDensity = 15000,
  backgroundColor = '#0a0a0a',
  showHandDots = true
}: ThreeSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomEffectRef = useRef<UnrealBloomPass | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastPinchStateRef = useRef(false);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const particleSystem = new ParticleSystem(particleDensity);
    scene.add(particleSystem.getMesh());
    particleSystemRef.current = particleSystem;

    const template = particleTemplates.find(t => t.id === selectedTemplate) || particleTemplates[0];
    particleSystem.setTemplate(template.generatePositions(particleDensity));

    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomIntensity,
      0.6,
      0.7
    );
    bloomEffectRef.current = bloomPass;
    composer.addPass(bloomPass);

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !composerRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      composerRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (particleSystemRef.current) {
        particleSystemRef.current.update();

        if (composerRef.current && bloomEnabled) {
          composerRef.current.render();
        } else if (sceneRef.current && cameraRef.current && rendererRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (particleSystemRef.current) {
        particleSystemRef.current.dispose();
      }

      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!particleSystemRef.current) return;

    const template = particleTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      particleSystemRef.current.setTemplate(template.generatePositions(particleDensity));
    }
  }, [selectedTemplate, particleDensity]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(backgroundColor);
    }
  }, [backgroundColor]);

  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.setColor(particleColor);
    }
  }, [particleColor]);

  useEffect(() => {
    if (bloomEffectRef.current) {
      bloomEffectRef.current.strength = bloomIntensity;
    }
  }, [bloomIntensity]);

  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.setSize(particleSize);
    }
  }, [particleSize]);

  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.setOpacity(particleOpacity);
    }
  }, [particleOpacity]);

  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.setPulsateIntensity(pulsateIntensity);
    }
  }, [pulsateIntensity]);

  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.setAutoRotateSpeed(autoRotateSpeed);
    }
  }, [autoRotateSpeed]);

  useEffect(() => {
    if (!particleSystemRef.current) return;

    const { leftHand, rightHand } = handData;

    if (leftHand.isDetected && rightHand.isDetected) {
      const dx = leftHand.position.x - rightHand.position.x;
      const dy = leftHand.position.y - rightHand.position.y;
      const dz = leftHand.position.z - rightHand.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const distanceScale = distance * 1.5;
      const opennessScale = rightHand.openness * 6;
      const combinedScale = (distanceScale * 0.7) + (opennessScale * 0.3);

      const scale = Math.max(0.1, Math.min(8, combinedScale));
      particleSystemRef.current.setTargetScale(scale);
    } else if (rightHand.isDetected) {
      const opennessScale = rightHand.openness * 6;
      const scale = Math.max(0.1, Math.min(8, opennessScale));
      particleSystemRef.current.setTargetScale(scale);
    }

    if (rightHand.isDetected) {
      particleSystemRef.current.setTargetRotation(
        rightHand.rotation.x,
        rightHand.rotation.y,
        rightHand.rotation.z
      );
    }

    if (leftHand.isPinching && !lastPinchStateRef.current) {
      const nextIndex = (currentColorIndex + 1) % colorPresets.length;
      setCurrentColorIndex(nextIndex);
      onColorChange(colorPresets[nextIndex].color);
    }
    lastPinchStateRef.current = leftHand.isPinching;
  }, [handData, currentColorIndex, onColorChange]);

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 w-full h-full" />
      {sceneRef.current && showHandDots && <HandFeedbackRings handData={handData} scene={sceneRef.current} />}
    </>
  );
};
