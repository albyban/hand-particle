import * as THREE from 'three';

export class ParticleSystem {
  private particles: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private basePositions: Float32Array;
  private currentPositions: Float32Array;
  private targetScale: number = 1;
  private currentScale: number = 1;
  private targetRotation: THREE.Euler = new THREE.Euler(0, 0, 0);
  private currentRotation: THREE.Euler = new THREE.Euler(0, 0, 0);
  private particleCount: number;
  private rotationMatrix: THREE.Matrix4 = new THREE.Matrix4();
  private baseSize: number = 0.03;
  private targetSize: number = 0.03;
  private pulsateIntensity: number = 0;
  private autoRotateSpeed: number = 0;
  private randomOffsets: Float32Array;
  private randomSpeeds: Float32Array;
  private colors: Float32Array;
  private glowPhases: Float32Array;
  private glowSpeeds: Float32Array;

  constructor(particleCount: number = 5000) {
    this.particleCount = particleCount;
    this.basePositions = new Float32Array(particleCount * 3);
    this.currentPositions = new Float32Array(particleCount * 3);
    this.randomOffsets = new Float32Array(particleCount * 3);
    this.randomSpeeds = new Float32Array(particleCount * 3);
    this.colors = new Float32Array(particleCount * 3);
    this.glowPhases = new Float32Array(particleCount);
    this.glowSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i++) {
      this.randomOffsets[i] = Math.random() * Math.PI * 2;
      this.randomSpeeds[i] = 0.5 + Math.random() * 1.5;
    }

    for (let i = 0; i < particleCount; i++) {
      this.glowPhases[i] = Math.random() * Math.PI * 2;
      this.glowSpeeds[i] = 0.8 + Math.random() * 1.8;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.currentPositions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: texture,
      vertexColors: true
    });

    this.particles = new THREE.Points(this.geometry, this.material);
  }

  setTemplate(positions: Float32Array): void {
    this.basePositions = positions;
    this.currentPositions = new Float32Array(positions);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.currentPositions, 3));
  }

  setColor(color: string): void {
    this.material.color.set(color);
  }

  setTargetScale(scale: number): void {
    this.targetScale = Math.max(0.1, Math.min(8, scale));
  }

  setTargetRotation(x: number, y: number, z: number): void {
    this.targetRotation.set(x, y, z);
  }

  setSize(size: number): void {
    this.targetSize = Math.max(0.01, Math.min(0.1, size));
  }

  setOpacity(opacity: number): void {
    this.material.opacity = Math.max(0, Math.min(1, opacity));
  }

  setPulsateIntensity(intensity: number): void {
    this.pulsateIntensity = Math.max(0, Math.min(1, intensity));
  }

  setAutoRotateSpeed(speed: number): void {
    this.autoRotateSpeed = speed;
  }

  update(): void {
    this.currentScale += (this.targetScale - this.currentScale) * 0.1;

    if (this.autoRotateSpeed !== 0) {
      this.currentRotation.y += this.autoRotateSpeed * 0.01;
    } else {
      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.1;
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.1;
      this.currentRotation.z += (this.targetRotation.z - this.currentRotation.z) * 0.1;
    }

    const currentSize = this.targetSize + (this.baseSize * 0.5) * Math.sin(Date.now() * 0.003) * this.pulsateIntensity;
    this.material.size = currentSize;

    this.rotationMatrix.makeRotationFromEuler(this.currentRotation);

    const tempVector = new THREE.Vector3();
    const time = Date.now() * 0.001;

    for (let i = 0; i < this.basePositions.length; i += 3) {
      const randomX = Math.sin(time * this.randomSpeeds[i] + this.randomOffsets[i]) * 0.02;
      const randomY = Math.sin(time * this.randomSpeeds[i + 1] + this.randomOffsets[i + 1]) * 0.02;
      const randomZ = Math.sin(time * this.randomSpeeds[i + 2] + this.randomOffsets[i + 2]) * 0.02;

      tempVector.set(
        (this.basePositions[i] + randomX) * this.currentScale,
        (this.basePositions[i + 1] + randomY) * this.currentScale,
        (this.basePositions[i + 2] + randomZ) * this.currentScale
      );

      tempVector.applyMatrix4(this.rotationMatrix);

      this.currentPositions[i] = tempVector.x;
      this.currentPositions[i + 1] = tempVector.y;
      this.currentPositions[i + 2] = tempVector.z;

      const particleIndex = i / 3;
      const glow = (Math.sin(time * this.glowSpeeds[particleIndex] + this.glowPhases[particleIndex]) + 1) * 0.5;
      const intensity = 0.2 + glow * 0.8;

      this.colors[i] = intensity;
      this.colors[i + 1] = intensity;
      this.colors[i + 2] = intensity;
    }

    const positionAttribute = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    positionAttribute.array = this.currentPositions;
    positionAttribute.needsUpdate = true;

    const colorAttribute = this.geometry.getAttribute('color') as THREE.BufferAttribute;
    colorAttribute.array = this.colors;
    colorAttribute.needsUpdate = true;
  }

  getMesh(): THREE.Points {
    return this.particles;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
