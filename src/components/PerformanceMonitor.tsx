import { useEffect, useState, useRef } from 'react';
import { Activity } from 'lucide-react';

interface PerformanceMonitorProps {
  show: boolean;
}

export const PerformanceMonitor = ({ show }: PerformanceMonitorProps) => {
  const [fps, setFps] = useState(60);
  const [avgFps, setAvgFps] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useEffect(() => {
    if (!show) return;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const currentFps = 1000 / delta;
      frameTimesRef.current.push(currentFps);

      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      frameCountRef.current++;

      if (frameCountRef.current % 10 === 0) {
        const avg = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        setFps(Math.round(currentFps));
        setAvgFps(Math.round(avg));
      }

      requestAnimationFrame(measureFPS);
    };

    const animationId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(animationId);
  }, [show]);

  if (!show) return null;

  const fpsColor = fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed bottom-6 right-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl w-48">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={16} className="text-white/60" />
        <h3 className="text-white text-sm font-light">Performance</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-white/60 text-xs">FPS</span>
          <span className={`text-lg font-medium ${fpsColor}`}>{fps}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60 text-xs">Avg FPS</span>
          <span className="text-white text-sm">{avgFps}</span>
        </div>

        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              fps >= 55 ? 'bg-green-400' : fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${Math.min(100, (fps / 60) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
