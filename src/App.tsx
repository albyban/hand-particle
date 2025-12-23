import { useState } from 'react';
import { ThreeScene } from './components/ThreeScene';
import { EnhancedControlPanel } from './components/EnhancedControlPanel';
import { HandIndicator } from './components/HandIndicator';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { useHandTracking } from './hooks/useHandTracking';

function App() {
  const { handData } = useHandTracking();
  const [selectedTemplate, setSelectedTemplate] = useState('sphere');
  const [particleColor, setParticleColor] = useState('#ffffff');
  const [bloomEnabled, setBloomEnabled] = useState(true);
  const [bloomIntensity, setBloomIntensity] = useState(1.5);
  const [particleSize, setParticleSize] = useState(0.03);
  const [particleOpacity, setParticleOpacity] = useState(0.8);
  const [particleDensity, setParticleDensity] = useState(15000);
  const [pulsateIntensity, setPulsateIntensity] = useState(0);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#0a0a0a');
  const [showPerformance, setShowPerformance] = useState(false);
  const [leftHandEnabled, setLeftHandEnabled] = useState(true);
  const [rightHandEnabled, setRightHandEnabled] = useState(true);
  const [showHandDots, setShowHandDots] = useState(true);

  const filteredHandData = {
    ...handData,
    leftHand: leftHandEnabled ? handData.leftHand : { ...handData.leftHand, isDetected: false },
    rightHand: rightHandEnabled ? handData.rightHand : { ...handData.rightHand, isDetected: false }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor }}
    >
      <ThreeScene
        handData={filteredHandData}
        selectedTemplate={selectedTemplate}
        particleColor={particleColor}
        onColorChange={setParticleColor}
        bloomEnabled={bloomEnabled}
        bloomIntensity={bloomIntensity}
        particleSize={particleSize}
        particleOpacity={particleOpacity}
        pulsateIntensity={pulsateIntensity}
        autoRotateSpeed={autoRotateSpeed}
        particleDensity={particleDensity}
        backgroundColor={backgroundColor}
        showHandDots={showHandDots}
      />

      <EnhancedControlPanel
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
        particleColor={particleColor}
        onColorChange={setParticleColor}
        bloomEnabled={bloomEnabled}
        onBloomEnabledChange={setBloomEnabled}
        bloomIntensity={bloomIntensity}
        onBloomIntensityChange={setBloomIntensity}
        particleSize={particleSize}
        onParticleSizeChange={setParticleSize}
        particleOpacity={particleOpacity}
        onParticleOpacityChange={setParticleOpacity}
        particleDensity={particleDensity}
        onParticleDensityChange={setParticleDensity}
        pulsateIntensity={pulsateIntensity}
        onPulsateIntensityChange={setPulsateIntensity}
        autoRotateSpeed={autoRotateSpeed}
        onAutoRotateSpeedChange={setAutoRotateSpeed}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={setBackgroundColor}
        leftHandEnabled={leftHandEnabled}
        onLeftHandEnabledChange={setLeftHandEnabled}
        rightHandEnabled={rightHandEnabled}
        onRightHandEnabledChange={setRightHandEnabled}
        showHandDots={showHandDots}
        onShowHandDotsChange={setShowHandDots}
      />

      <HandIndicator
        leftHand={filteredHandData.leftHand}
        rightHand={filteredHandData.rightHand}
      />

      <div className="fixed top-6 left-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-white text-2xl font-light tracking-wider">Particle System</h1>
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className="text-xs text-white/60 hover:text-white transition-colors"
          >
            {showPerformance ? 'Hide' : 'Show'} FPS
          </button>
        </div>
      </div>

      <PerformanceMonitor show={showPerformance} />
    </div>
  );
}

export default App;
