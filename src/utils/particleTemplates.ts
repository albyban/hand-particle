import * as THREE from 'three';

export interface ParticleTemplate {
  id: string;
  name: string;
  generatePositions: (count: number) => Float32Array;
}

const generateSpherePositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const radius = 2;

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return positions;
};

const generateCubePositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const size = 2;

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * size * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * size * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * size * 2;
  }

  return positions;
};

const generatePyramidPositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const baseSize = 2;
  const height = 3;

  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const u = Math.random();
    const v = Math.random();

    const scale = Math.pow(1 - t, 1/3);

    const x = (u - 0.5) * baseSize * 2 * scale;
    const y = t * height - height / 2;
    const z = (v - 0.5) * baseSize * 2 * scale;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
};

const generateTorusPositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const majorRadius = 2;
  const minorRadius = 0.8;

  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;

    positions[i * 3] = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
    positions[i * 3 + 1] = minorRadius * Math.sin(v);
    positions[i * 3 + 2] = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
  }

  return positions;
};

const generateHelixPositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const radius = 1.5;
  const height = 4;
  const coils = 3;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 2 * coils;
    const y = (t - 0.5) * height;

    const noiseRadius = radius + (Math.random() - 0.5) * 0.3;
    const noiseY = y + (Math.random() - 0.5) * 0.3;

    positions[i * 3] = noiseRadius * Math.cos(angle);
    positions[i * 3 + 1] = noiseY;
    positions[i * 3 + 2] = noiseRadius * Math.sin(angle);
  }

  return positions;
};

const generateDNAPositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const radius = 1.2;
  const height = 4;
  const coils = 2;
  const strandThickness = 0.15;
  const barThickness = 0.12;

  const strandsParticles = Math.floor(count * 0.6);
  const barsParticles = count - strandsParticles;

  for (let i = 0; i < strandsParticles; i++) {
    const strand = i % 2;
    const t = Math.floor(i / 2) / Math.floor(strandsParticles / 2);
    const angle = t * Math.PI * 2 * coils + strand * Math.PI;
    const y = (t - 0.5) * height;

    const offsetRadius = (Math.random() - 0.5) * strandThickness;
    const offsetAngle = Math.random() * Math.PI * 2;

    const baseX = radius * Math.cos(angle);
    const baseZ = radius * Math.sin(angle);

    positions[i * 3] = baseX + offsetRadius * Math.cos(offsetAngle);
    positions[i * 3 + 1] = y + (Math.random() - 0.5) * strandThickness;
    positions[i * 3 + 2] = baseZ + offsetRadius * Math.sin(offsetAngle);
  }

  const barsPerCoil = 8;
  const totalBars = coils * barsPerCoil;

  for (let i = 0; i < barsParticles; i++) {
    const barIndex = Math.floor(Math.random() * totalBars);
    const t = barIndex / totalBars;
    const angle = t * Math.PI * 2 * coils;
    const y = (t - 0.5) * height;

    const barProgress = Math.random();
    const x = radius * Math.cos(angle) * (1 - barProgress) + radius * Math.cos(angle + Math.PI) * barProgress;
    const z = radius * Math.sin(angle) * (1 - barProgress) + radius * Math.sin(angle + Math.PI) * barProgress;

    const offsetRadius = (Math.random() - 0.5) * barThickness;
    const offsetAngle = Math.random() * Math.PI * 2;

    const idx = strandsParticles + i;
    positions[idx * 3] = x + offsetRadius * Math.cos(offsetAngle);
    positions[idx * 3 + 1] = y + (Math.random() - 0.5) * barThickness;
    positions[idx * 3 + 2] = z + offsetRadius * Math.sin(offsetAngle);
  }

  return positions;
};

const generateGalaxyPositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const arms = 3;
  const armSpread = 0.5;

  for (let i = 0; i < count; i++) {
    const armIndex = i % arms;
    const t = Math.pow(Math.random(), 0.7);
    const angle = (armIndex / arms) * Math.PI * 2 + t * Math.PI * 4;
    const radius = t * 3;

    const armOffset = (Math.random() - 0.5) * armSpread * radius;
    const yOffset = (Math.random() - 0.5) * 0.3 * radius;

    positions[i * 3] = (radius + armOffset) * Math.cos(angle);
    positions[i * 3 + 1] = yOffset;
    positions[i * 3 + 2] = (radius + armOffset) * Math.sin(angle);
  }

  return positions;
};

const generateStarPositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const points = 5;
  const outerRadius = 2.5;
  const innerRadius = 1;
  const thickness = 0.3;

  for (let i = 0; i < count; i++) {
    const pointIndex = Math.floor(Math.random() * points * 2);
    const isOuter = pointIndex % 2 === 0;
    const angle = (pointIndex / (points * 2)) * Math.PI * 2;
    const radius = isOuter ? outerRadius : innerRadius;

    const t = Math.random();
    const currentRadius = radius * t;

    positions[i * 3] = currentRadius * Math.cos(angle);
    positions[i * 3 + 1] = (Math.random() - 0.5) * thickness;
    positions[i * 3 + 2] = currentRadius * Math.sin(angle);
  }

  return positions;
};

const generateSaturnPositions = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const sphereRadius = 1.5;
  const ringInnerRadius = 2;
  const ringOuterRadius = 3;
  const ringThickness = 0.1;

  const sphereParticles = Math.floor(count * 0.6);
  const ringParticles = count - sphereParticles;

  for (let i = 0; i < sphereParticles; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;

    positions[i * 3] = sphereRadius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = sphereRadius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = sphereRadius * Math.cos(phi);
  }

  for (let i = sphereParticles; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = ringInnerRadius + Math.random() * (ringOuterRadius - ringInnerRadius);
    const yOffset = (Math.random() - 0.5) * ringThickness;

    positions[i * 3] = radius * Math.cos(angle);
    positions[i * 3 + 1] = yOffset;
    positions[i * 3 + 2] = radius * Math.sin(angle);
  }

  return positions;
};

export const particleTemplates: ParticleTemplate[] = [
  {
    id: 'sphere',
    name: 'Sphere',
    generatePositions: generateSpherePositions
  },
  {
    id: 'torus',
    name: 'Torus',
    generatePositions: generateTorusPositions
  },
  {
    id: 'helix',
    name: 'Helix',
    generatePositions: generateHelixPositions
  },
  {
    id: 'dna',
    name: 'DNA',
    generatePositions: generateDNAPositions
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    generatePositions: generateGalaxyPositions
  },
  {
    id: 'star',
    name: 'Star',
    generatePositions: generateStarPositions
  },
  {
    id: 'saturn',
    name: 'Saturn',
    generatePositions: generateSaturnPositions
  }
];
