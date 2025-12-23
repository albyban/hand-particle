import { HexColorPicker } from 'react-colorful';
import { Box, Circle, Triangle, Globe, CircleDot, Dna, Sparkles, Star } from 'lucide-react';
import { particleTemplates } from '../utils/particleTemplates';

interface ControlPanelProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  particleColor: string;
  onColorChange: (color: string) => void;
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

export const ControlPanel = ({
  selectedTemplate,
  onTemplateChange,
  particleColor,
  onColorChange
}: ControlPanelProps) => {
  return (
    <div className="fixed top-6 right-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl w-72">
      <h2 className="text-white text-lg font-light mb-6 tracking-wide">Controls</h2>

      <div className="mb-8">
        <h3 className="text-white/70 text-sm font-light mb-3 tracking-wide">Template</h3>
        <div className="grid grid-cols-2 gap-3">
          {particleTemplates.map((template) => {
            const Icon = templateIcons[template.id];
            const isSelected = selectedTemplate === template.id;

            return (
              <button
                key={template.id}
                onClick={() => onTemplateChange(template.id)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl
                  transition-all duration-300 ease-out
                  ${isSelected
                    ? 'bg-white/20 border-2 border-white/40 shadow-lg'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <Icon
                  size={24}
                  className={`mb-2 transition-colors ${isSelected ? 'text-white' : 'text-white/60'}`}
                />
                <span className={`text-xs transition-colors ${isSelected ? 'text-white' : 'text-white/50'}`}>
                  {template.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-white/70 text-sm font-light mb-3 tracking-wide">Color</h3>
        <div className="relative">
          <HexColorPicker
            color={particleColor}
            onChange={onColorChange}
            style={{ width: '100%', height: '150px' }}
          />
          <div
            className="mt-3 h-10 rounded-lg border border-white/10"
            style={{ backgroundColor: particleColor }}
          />
        </div>
      </div>
    </div>
  );
};
