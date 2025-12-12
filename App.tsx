import React, { useState, useRef, useEffect } from 'react';
import { analyzeMedia } from './services/geminiService';
import { AppState, ScanResult, ActiveTab } from './types';
import { ResultCard } from './components/ResultCard';
import { AnalysisLoader } from './components/AnalysisLoader';
import { BottomNav } from './components/BottomNav';
import { HistoryView } from './components/HistoryView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('SCANNER');
  const [state, setState] = useState<AppState>('IDLE');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  
  // Dual Image State
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [frontBase64, setFrontBase64] = useState<string | null>(null);
  
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [backBase64, setBackBase64] = useState<string | null>(null);
  const [backMediaType, setBackMediaType] = useState<string>(''); // mime type of main/back

  // Refs for hidden inputs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFrontSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setFrontPreview(objectUrl);
    
    const reader = new FileReader();
    reader.onloadend = () => {
        setFrontBase64((reader.result as string).split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleBackSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setBackPreview(objectUrl);
    setBackMediaType(file.type);

    const reader = new FileReader();
    reader.onloadend = () => {
        setBackBase64((reader.result as string).split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const initiateScan = async () => {
    if (!backBase64) return; // Back/Label is mandatory

    setState('ANALYZING');
    
    try {
        // Pass Back (Primary) and Front (Optional)
        const result = await analyzeMedia(backBase64, backMediaType, frontBase64);
        
        const delay = result.isCached ? 800 : 3000;
        
        setTimeout(() => {
             if (result.verdict_title === 'Unrecognized' || result.purity_score === 0) {
                 setScanResult(null);
                 setState('ERROR');
             } else {
                 setScanResult(result);
                 setState('SUCCESS');
             }
        }, delay);

    } catch (error) {
        console.error(error);
        setState('ERROR');
    }
  };

  const resetApp = () => {
    setState('IDLE');
    setScanResult(null);
    setFrontPreview(null);
    setFrontBase64(null);
    setBackPreview(null);
    setBackBase64(null);
    setBackMediaType('');
    if (frontInputRef.current) frontInputRef.current.value = '';
    if (backInputRef.current) backInputRef.current.value = '';
  };

  const isVideo = backMediaType.startsWith('video/');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, 
               backgroundSize: '40px 40px' 
             }}>
        </div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      </div>

      <main className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
        
        {/* VIEW: SCANNER */}
        {activeTab === 'SCANNER' && (
            <>
                {/* IDLE: DASHBOARD */}
                {state === 'IDLE' && (
                <div className="flex-1 flex flex-col p-6 animate-fade-in-up pb-28">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">System Ready</span>
                            <span className="text-xl font-black text-slate-900">LABEL LENS OS</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <span className="text-[10px] font-bold text-slate-500">v4.5 DUAL-CORE</span>
                        </div>
                    </div>

                    {/* DUAL SLOT SCANNER INTERFACE */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        
                        {/* Slot 1: Front Image (Optional) */}
                        <div 
                          onClick={() => frontInputRef.current?.click()}
                          className={`w-full h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center relative overflow-hidden group ${frontPreview ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-white/50'}`}
                        >
                            {frontPreview ? (
                                <>
                                  <img src={frontPreview} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">Front Loaded</span>
                                  </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-slate-400 group-hover:text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    </svg>
                                    <span className="text-xs font-bold uppercase">Front Photo (Optional)</span>
                                    <span className="text-[10px]">For visual verification</span>
                                </div>
                            )}
                        </div>

                        {/* Slot 2: Back Image (Required) */}
                        <div 
                          onClick={() => backInputRef.current?.click()}
                          className={`w-full h-40 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center relative overflow-hidden group shadow-lg ${backPreview ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white hover:shadow-xl'}`}
                        >
                            {backPreview ? (
                                <>
                                  {backMediaType.startsWith('video/') ? (
                                      <video src={backPreview} className="absolute inset-0 w-full h-full object-cover opacity-60" muted />
                                  ) : (
                                      <img src={backPreview} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                      <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">Label Loaded</span>
                                  </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center text-slate-800">
                                    <div className="p-3 bg-slate-100 rounded-full mb-2 group-hover:bg-slate-200 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-black uppercase">Back / Label (Required)</span>
                                    <span className="text-[10px] text-slate-500">Photo or Video of Ingredients</span>
                                </div>
                            )}
                        </div>

                        {/* Scan Button */}
                        <button 
                        onClick={initiateScan}
                        disabled={!backBase64}
                        className={`w-full py-4 rounded-xl shadow-xl font-bold flex items-center justify-center gap-2 transition-all ${backBase64 ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            <span>INITIATE ANALYSIS</span>
                            {backBase64 && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                        </button>
                        
                        {/* Hidden Inputs */}
                        <input 
                            type="file" ref={frontInputRef} className="hidden" 
                            accept="image/*" onChange={handleFrontSelect}
                        />
                        <input 
                            type="file" ref={backInputRef} className="hidden" 
                            accept="image/*,video/*" onChange={handleBackSelect}
                        />
                    </div>
                    
                    {/* Info Footer */}
                    <div className="mt-8">
                        <div className="bg-white/60 p-4 rounded-xl border border-slate-100 shadow-sm backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Protocol</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-snug">
                                For maximum accuracy, upload the <strong>Product Front</strong> to verify identity and the <strong>Label</strong> for nutrition facts. AI checks for product mismatches.
                            </p>
                        </div>
                    </div>
                </div>
                )}

                {/* ANALYZING */}
                {state === 'ANALYZING' && (
                    <div className="flex flex-col items-center justify-center h-full pt-12">
                        <div className="relative mb-8">
                            {/* Stacked Preview Animation */}
                            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-200 bg-white relative z-10">
                                {isVideo ? <video src={backPreview!} className="w-full h-full object-cover" muted autoPlay loop /> : <img src={backPreview!} className="w-full h-full object-cover" />}
                            </div>
                            {frontPreview && (
                                <div className="absolute top-[-10px] left-[-10px] w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-100 bg-slate-50 -z-0 opacity-60 scale-95">
                                    <img src={frontPreview} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <AnalysisLoader />
                    </div>
                )}

                {/* SUCCESS */}
                {state === 'SUCCESS' && scanResult && (
                <ResultCard data={scanResult} onReset={resetApp} imageBase64={backBase64} />
                )}

                {/* ERROR */}
                {state === 'ERROR' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in-up pb-28">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008h-.008v-.008z" />
                    </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Scan Failed</h2>
                    <p className="text-slate-500 text-center mb-8 max-w-xs">
                    We couldn't detect a valid food item or label. Ensure you are uploading valid food imagery.
                    </p>
                    <button 
                    onClick={resetApp}
                    className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
                    >
                    Try Again
                    </button>
                </div>
                )}
            </>
        )}

        {/* VIEW: HISTORY */}
        {activeTab === 'HISTORY' && (
            <HistoryView />
        )}

      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}