export interface ColorPreset {
  id: string;
  name: string;
  color: string;
  gradient?: string[];
}

export const colorPresets: ColorPreset[] = [
  {
    id: 'white',
    name: 'Pure White',
    color: '#ffffff',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    color: '#ff6b35',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    color: '#0077be',
  },
  {
    id: 'neon',
    name: 'Neon',
    color: '#00ff88',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    color: '#66ffcc',
  },
  {
    id: 'fire',
    name: 'Fire',
    color: '#ff3333',
  },
  {
    id: 'ice',
    name: 'Ice',
    color: '#88ddff',
  },
  {
    id: 'forest',
    name: 'Forest',
    color: '#44aa44',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    color: '#8844ff',
  },
];
