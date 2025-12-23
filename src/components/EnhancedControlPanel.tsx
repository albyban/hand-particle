import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  Globe, CircleDot, Sparkles, Dna, Star, Circle,
  ChevronDown, ChevronUp, Sliders, Palette, Settings,
  Play, Pause, Hand
} from 'lucide-react';
import { particleTemplates } from '../utils/particleTemplates';
import { colorPresets } from '../utils/colorPresets';

interface EnhancedControlPanelProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  particleColor: string;
  onColorChange: (color: string) => void;
  bloomEnabled: boolean;
  onBloomEnabledChange: (enabled: boolean) => void;
  bloomIntensity: number;
  onBloomIntensityChange: (intensity: number) => void;
  particleSize: number;
  onParticleSizeChange: (size: number) => void;
  particleOpacity: number;
  onParticleOpacityChange: (opacity: number) => void;
  particleDensity: number;
  onParticleDensityChange: (density: number) => void;
  pulsateIntensity: number;
  onPulsateIntensityChange: (intensity: number) => void;
  autoRotateSpeed: number;
  onAutoRotateSpeedChange: (speed: number) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  leftHandEnabled: boolean;
  onLeftHandEnabledChange: (enabled: boolean) => void;
  rightHandEnabled: boolean;
  onRightHandEnabledChange: (enabled: boolean) => void;
  showHandDots: boolean;
  onShowHandDotsChange: (enabled: boolean) => void;
}

const templateIcons: Record<string, any> = {
  sphere: Globe,
  torus: CircleDot,
  helix: Sparkles,
  dna: Dna,
  galaxy: Sparkles,
  star: Star,
  saturn: Circle
};

export const EnhancedControlPanel = ({
  selectedTemplate,
  onTemplateChange,
  particleColor,
  onColorChange,
  bloomEnabled,
  onBloomEnabledChange,
  bloomIntensity,
  onBloomIntensityChange,
  particleSize,
  onParticleSizeChange,
  particleOpacity,
  onParticleOpacityChange,
  particleDensity,
  onParticleDensityChange,
  pulsateIntensity,
  onPulsateIntensityChange,
  autoRotateSpeed,
  onAutoRotateSpeedChange,
  backgroundColor,
  onBackgroundColorChange,
  leftHandEnabled,
  onLeftHandEnabledChange,
  rightHandEnabled,
  onRightHandEnabledChange,
  showHandDots,
  onShowHandDotsChange
}: EnhancedControlPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('templates');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isAutoRotating = autoRotateSpeed !== 0;

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed top-6 right-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl hover:bg-black/40 transition-all"
      >
        <Sliders size={24} className="text-white" />
      </button>
    );
  }

  return (
    <div className="fixed top-6 right-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-80 max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-black/50 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-white text-lg font-light tracking-wide">Controls</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <ChevronUp size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <Section
          icon={<Globe size={18} />}
          title="Templates"
          isExpanded={expandedSection === 'templates'}
          onToggle={() => toggleSection('templates')}
        >
          <div className="grid grid-cols-2 gap-2">
            {particleTemplates.map((template) => {
              const Icon = templateIcons[template.id];
              const isSelected = selectedTemplate === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => onTemplateChange(template.id)}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-xl
                    transition-all duration-300 ease-out
                    ${isSelected
                      ? 'bg-white/20 border-2 border-white/40 shadow-lg scale-105'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105'
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={`mb-1 transition-colors ${isSelected ? 'text-white' : 'text-white/60'}`}
                  />
                  <span className={`text-xs transition-colors ${isSelected ? 'text-white' : 'text-white/50'}`}>
                    {template.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section
          icon={<Palette size={18} />}
          title="Colors"
          isExpanded={expandedSection === 'colors'}
          onToggle={() => toggleSection('colors')}
        >
          <div className="space-y-3">
            <div>
              <h4 className="text-white/60 text-xs mb-2">Presets</h4>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onColorChange(preset.color)}
                    className="group relative h-10 rounded-lg border border-white/10 hover:border-white/30 transition-all hover:scale-110"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white/60 text-xs mb-2">Custom</h4>
              <HexColorPicker
                color={particleColor}
                onChange={onColorChange}
                style={{ width: '100%', height: '120px' }}
              />
            </div>
          </div>
        </Section>

        <Section
          icon={<Settings size={18} />}
          title="Particle Settings"
          isExpanded={expandedSection === 'particles'}
          onToggle={() => toggleSection('particles')}
        >
          <div className="space-y-4">
            <Slider
              label="Density"
              value={particleDensity}
              onChange={onParticleDensityChange}
              min={5000}
              max={25000}
              step={5000}
              displayValue={`${(particleDensity / 1000).toFixed(0)}k`}
            />

            <Slider
              label="Size"
              value={particleSize}
              onChange={onParticleSizeChange}
              min={0.01}
              max={0.1}
              step={0.01}
              displayValue={(particleSize * 100).toFixed(0)}
            />

            <Slider
              label="Opacity"
              value={particleOpacity}
              onChange={onParticleOpacityChange}
              min={0}
              max={1}
              step={0.1}
              displayValue={`${(particleOpacity * 100).toFixed(0)}%`}
            />

            <Slider
              label="Pulsate"
              value={pulsateIntensity}
              onChange={onPulsateIntensityChange}
              min={0}
              max={1}
              step={0.1}
              displayValue={`${(pulsateIntensity * 100).toFixed(0)}%`}
            />
          </div>
        </Section>

        <Section
          icon={<Sliders size={18} />}
          title="Effects"
          isExpanded={expandedSection === 'effects'}
          onToggle={() => toggleSection('effects')}
        >
          <div className="space-y-4">
            <Toggle
              label="Bloom Glow"
              enabled={bloomEnabled}
              onChange={onBloomEnabledChange}
            />

            {bloomEnabled && (
              <Slider
                label="Bloom Intensity"
                value={bloomIntensity}
                onChange={onBloomIntensityChange}
                min={0}
                max={3}
                step={0.1}
                displayValue={bloomIntensity.toFixed(1)}
              />
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-xs">Auto Rotate</span>
                <button
                  onClick={() => onAutoRotateSpeedChange(isAutoRotating ? 0 : 1)}
                  className={`p-2 rounded-lg transition-all ${
                    isAutoRotating
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {isAutoRotating ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>

              {isAutoRotating && (
                <Slider
                  label="Speed"
                  value={autoRotateSpeed}
                  onChange={onAutoRotateSpeedChange}
                  min={-3}
                  max={3}
                  step={0.1}
                  displayValue={autoRotateSpeed.toFixed(1)}
                />
              )}
            </div>
          </div>
        </Section>

        <Section
          icon={<Hand size={18} />}
          title="Hand Tracking"
          isExpanded={expandedSection === 'hands'}
          onToggle={() => toggleSection('hands')}
        >
          <div className="space-y-3">
            <Toggle
              label="Left Hand"
              enabled={leftHandEnabled}
              onChange={onLeftHandEnabledChange}
            />
            <Toggle
              label="Right Hand"
              enabled={rightHandEnabled}
              onChange={onRightHandEnabledChange}
            />
            <Toggle
              label="Show Hand Dots"
              enabled={showHandDots}
              onChange={onShowHandDotsChange}
            />
            <p className="text-white/40 text-xs mt-2">
              Disable hands you don't want to control the particles. Perfect for video recording!
            </p>
          </div>
        </Section>

        <Section
          icon={<Circle size={18} />}
          title="Background"
          isExpanded={expandedSection === 'background'}
          onToggle={() => toggleSection('background')}
        >
          <div className="space-y-3">
            <HexColorPicker
              color={backgroundColor}
              onChange={onBackgroundColorChange}
              style={{ width: '100%', height: '120px' }}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

const Section = ({
  icon,
  title,
  isExpanded,
  onToggle,
  children
}: {
  icon: React.ReactNode;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="border border-white/10 rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-white/60">{icon}</span>
        <span className="text-white text-sm font-light">{title}</span>
      </div>
      {isExpanded ? <ChevronUp size={16} className="text-white/60" /> : <ChevronDown size={16} className="text-white/60" />}
    </button>
    {isExpanded && <div className="p-3">{children}</div>}
  </div>
);

const Slider = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  displayValue
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  displayValue: string;
}) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-white/60 text-xs">{label}</span>
      <span className="text-white text-xs font-medium">{displayValue}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
    />
  </div>
);

const Toggle = ({
  label,
  enabled,
  onChange
}: {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-white/60 text-xs">{label}</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-white/30' : 'bg-white/10'
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);
