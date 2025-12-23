import { Hand } from 'lucide-react';
import { HandState } from '../hooks/useHandTracking';

interface HandIndicatorProps {
  leftHand: HandState;
  rightHand: HandState;
}

export const HandIndicator = ({ leftHand, rightHand }: HandIndicatorProps) => {
  const renderHandStatus = (hand: HandState, label: string) => {
    const percentage = Math.round(hand.openness * 100);

    return (
      <div className="flex items-center space-x-3">
        <Hand
          size={20}
          className={`transition-colors ${hand.isDetected ? 'text-green-400' : 'text-white/30'}`}
        />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-white/60">{label}</span>
            {hand.isDetected && (
              <span className="text-xs text-white/80">{percentage}%</span>
            )}
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                hand.isDetected ? 'bg-green-400' : 'bg-white/20'
              }`}
              style={{ width: `${hand.isDetected ? percentage : 0}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 left-6 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl w-72">
      <h3 className="text-white text-sm font-light mb-4 tracking-wide">Hand Detection</h3>
      <div className="space-y-4">
        {renderHandStatus(leftHand, 'Left Hand')}
        {renderHandStatus(rightHand, 'Right Hand')}
      </div>

      <div className="mt-5 pt-4 border-t border-white/10">
        <p className="text-xs text-white/50 leading-relaxed">
          Move hands closer or further apart to scale particles. Rotate your right wrist to spin them.
        </p>
      </div>
    </div>
  );
};
