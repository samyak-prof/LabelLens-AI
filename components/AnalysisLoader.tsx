import React, { useEffect, useState } from 'react';

const ScanStages = [
  "Initializing optics...",
  "Calibrating sensors...",
  "Scanning patterns...",
  "Analyzing molecular data...",
  "Cross-referencing database...",
  "Synthesizing report..."
];

export const AnalysisLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [fluctuation, setFluctuation] = useState(0); 

  useEffect(() => {
    // Main progress timer
    const totalTime = 4000;
    const intervalTime = 50;
    const steps = totalTime / intervalTime;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(100, Math.floor((currentStep / steps) * 100));
      setProgress(percent);

      const stage = Math.min(ScanStages.length - 1, Math.floor((percent / 100) * ScanStages.length));
      setStageIndex(stage);

      // Simulate data processing fluctuation (neutral blue activity)
      setFluctuation(Math.random() * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in-up w-full max-w-sm mx-auto">
      
      {/* Central "Gauge" Animation - NEUTRAL BLUE THEME */}
      <div className="relative w-full h-12 bg-slate-100 rounded-full mb-8 overflow-hidden border border-slate-200 shadow-inner">
        {/* Grid lines background */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 95%, #94a3b8 95%)', backgroundSize: '20px 100%' }}></div>
        
        {/* Dynamic Activity Bar */}
        <div 
            className="absolute top-0 bottom-0 transition-all duration-100 ease-linear opacity-80 bg-blue-500 blur-md"
            style={{
                left: `${50 - (fluctuation / 2)}%`,
                width: `${fluctuation}%`,
                boxShadow: '0 0 20px #3b82f6'
            }}
        ></div>
        <div 
            className="absolute top-0 bottom-0 transition-all duration-100 ease-linear bg-blue-400 mix-blend-overlay"
            style={{
                left: `${50 - (fluctuation / 3)}%`,
                width: `${fluctuation / 1.5}%`,
            }}
        ></div>
        
        {/* Labels */}
        <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center text-[10px] font-bold text-slate-500 tracking-[0.2em] animate-pulse">
            ANALYZING DATA STRUCTURE
        </div>
      </div>

      <div className="text-center w-full space-y-4">
        <div className="flex justify-between text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
        </div>
        
        {/* Standard Linear Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
                className="h-full bg-slate-900 transition-all duration-75 ease-out rounded-full relative overflow-hidden"
                style={{ width: `${progress}%` }}
            >
                 <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1s_infinite]"></div>
            </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 h-8 mt-4 transition-all duration-300">
            {ScanStages[stageIndex]}
        </h2>
        
        <p className="text-sm text-slate-400">
            AI Vision Model running...
        </p>
      </div>
    </div>
  );
}