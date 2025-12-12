import React, { useEffect, useState } from 'react';
import { ScanResult } from '../types';
import { getHistory } from '../services/geminiService';

export const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in-up">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">No History Yet</h3>
        <p className="text-slate-500 mt-2">Your past scans will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-28 animate-fade-in-up min-h-screen">
      <h2 className="text-2xl font-black text-slate-900 mb-6 sticky top-0 bg-slate-50/90 backdrop-blur-sm py-4 z-10">Scan History</h2>
      
      <div className="space-y-4">
        {history.map((item, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]"
          >
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                     <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: item.verdict_color }}
                     ></span>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {new Date(item.timestamp || Date.now()).toLocaleDateString()}
                     </span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight" style={{ color: item.verdict_color }}>
                    {item.verdict_title}
                </h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.summary}</p>
            </div>
            
            <div className="flex flex-col items-center justify-center pl-4 border-l border-slate-100 min-w-[60px]">
                <span className="text-2xl font-black text-slate-900">{item.purity_score}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Score</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};