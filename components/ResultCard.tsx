import React from 'react';
import { ScanResult } from '../types';
import { HeroGauge } from './HeroGauge';
import { generateLabReport } from '../services/pdfService';

interface ResultCardProps {
  data: ScanResult;
  onReset: () => void;
  imageBase64: string | null; // Back/Main image
  frontImageBase64?: string | null; // Optional front
}

// Helper to determine icon based on keyword
const getNutrientIcon = (text: string) => {
  const lower = text.toLowerCase();
  
  if (lower.includes('protein') || lower.includes('energy')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
      </svg>
    );
  }
  
  if (lower.includes('fiber') || lower.includes('plant') || lower.includes('whole') || lower.includes('grain') || lower.includes('natural')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5.166 2.621v.058c-.595.346-1.044.883-1.243 1.521l-.546 1.75a5.5 5.5 0 008.318 5.702l.718-.375a.75.75 0 01.836.14l4.242 4.242a.75.75 0 01-1.06 1.06l-4.242-4.242a.75.75 0 01-.14-.836l.375-.718a5.5 5.5 0 00-5.702-8.318l-1.75.546c-.638.199-1.175.648-1.521 1.243v-.058a.75.75 0 011.5 0v.102a4 4 0 013.916 3.063l.546 1.75a4.001 4.001 0 01-5.702 6.049l-.718.375a2.25 2.25 0 00-1.077 1.99c0 .769.463 1.42 1.127 1.745l.133.065c.67.327 1.417.472 2.155.362l.52-.076a7.5 7.5 0 005.12-3.11l.526-.657a.75.75 0 011.173.938l-.526.656a9 9 0 01-6.143 3.731l-.52.077c-.902.133-1.815-.044-2.632-.443l-.133-.065A3.75 3.75 0 012.25 14.5c0-1.25.626-2.348 1.576-3.037l.718-.375a4 4 0 016.049-5.702l1.75-.546a4.001 4.001 0 013.063-3.916h.102a.75.75 0 010 1.5h-.058z" clipRule="evenodd" />
      </svg>
    );
  }

  if (lower.includes('vit') || lower.includes('min') || lower.includes('calc') || lower.includes('iron')) {
     return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" />
        </svg>
     )
  }
  
  if (lower.includes('fat') || lower.includes('oil')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
       <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
    </svg>
  );
};

export const ResultCard: React.FC<ResultCardProps> = ({ data, onReset, imageBase64, frontImageBase64 }) => {

  const handleDownloadReport = () => {
    generateLabReport(data, imageBase64, frontImageBase64);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen pb-20 animate-fade-in-up transition-all duration-500 ease-out">
      {/* Sticky Header Actions */}
      <div className="sticky top-0 z-50 flex justify-between items-center p-6 backdrop-blur-md bg-white/80 border-b border-slate-100/50 transition-all duration-300">
        <button 
          onClick={onReset}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 active:scale-95"
          aria-label="Back to Scan"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        
        {data.isCached ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/90 backdrop-blur-md border border-indigo-200 text-indigo-700 rounded-full shadow-sm animate-fade-in-up">
                <div className="relative flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-600 animate-pulse">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-800">Match</span>
                </div>
            </div>
        ) : (
            <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Live Analysis</div>
        )}
      </div>

      <div className="px-6 pt-2">
        {/* Purity Score Gauge Visualization */}
        <div className="transform transition-transform duration-700 ease-out hover:scale-105">
           <HeroGauge score={data.purity_score} color={data.verdict_color} />
        </div>

        <div className="text-center mb-6 transition-opacity duration-500 delay-100">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2" style={{ color: data.verdict_color }}>
            {data.verdict_title}
          </h1>
          <p className="text-slate-600 font-medium leading-relaxed mb-4">
            {data.summary}
          </p>

          {/* MISMATCH / CONSISTENCY WARNING */}
          {data.consistency_warning && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-left animate-pulse">
                  <div className="flex items-center gap-2 mb-1 text-red-700 font-bold text-xs uppercase tracking-wider">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
                     Consistency Alert
                  </div>
                  <p className="text-sm text-red-800 font-medium">
                      {data.consistency_warning}
                  </p>
              </div>
          )}

           {/* FRESHNESS INDICATOR */}
          {data.freshness_analysis && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-left">
                  <div className="flex items-center gap-2 mb-1 text-green-700 font-bold text-xs uppercase tracking-wider">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" /></svg>
                     Freshness Detected
                  </div>
                  <p className="text-sm text-green-800 font-medium">
                      {data.freshness_analysis}
                  </p>
              </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex justify-center transition-all duration-300 delay-150">
            <button 
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="font-bold text-sm">Download Lab Report</span>
            </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-transform hover:scale-[1.02] duration-300 ease-in-out">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nutrients</span>
            <div className="space-y-2">
              {data.nutrients_highlight.length > 0 ? (
                 data.nutrients_highlight.map((n, i) => (
                  <div key={i} className="text-sm font-semibold text-slate-700 flex items-center transition-transform duration-300 hover:translate-x-1">
                    <span className="flex items-center justify-center w-6 h-6 bg-green-50 text-green-600 rounded-full mr-2 shadow-sm">
                        {getNutrientIcon(n)}
                    </span>
                    {n}
                  </div>
                ))
              ) : (
                <span className="text-sm text-slate-400 italic">None detected</span>
              )}
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col transition-transform hover:scale-[1.02] duration-300 ease-in-out">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Warnings</span>
             <div className="text-sm font-semibold text-slate-700 flex items-center h-full">
                <span className={`w-2 h-2 rounded-full mr-2 shadow-[0_0_8px_rgba(0,0,0,0.4)] animate-pulse ${data.warning_level === 'LOW' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></span>
                Level: {data.warning_level}
             </div>
          </div>
        </div>

        {/* Ingredients Breakdown */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 mb-12 transition-all duration-500 delay-200 hover:shadow-2xl hover:bg-white/70">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Additives Detected
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {data.additives_found.length > 0 ? (
              data.additives_found.map((additive, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-100 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default select-none"
                >
                  {additive}
                </span>
              ))
            ) : (
              <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-4 py-3 rounded-xl w-full border border-green-100 transition-all duration-300 hover:bg-green-100/50">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                No harmful additives found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}