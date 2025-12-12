import React, { useEffect, useState } from 'react';

interface HeroGaugeProps {
  score: number;
  color: string;
}

export const HeroGauge: React.FC<HeroGaugeProps> = ({ score, color }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const size = 200;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = size / 2 - strokeWidth * 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate score from 0 to target
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = score / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [score]);

  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Glow Effect Background */}
      <div 
        className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 transition-colors duration-1000"
        style={{ backgroundColor: color }}
      ></div>

      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100"
          />
          {/* Progress Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
          <span className="text-5xl font-extrabold tracking-tighter">
            {animatedScore}
          </span>
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase mt-1">
            Purity
          </span>
        </div>
      </div>
    </div>
  );
};
