"use client";

import { useState, useEffect } from 'react';
import AudioEngine from '@/components/AudioEngine';
import VibeOrb from '@/components/VibeOrb';
import ContextTerminal from '@/components/ContextTerminal';
import { Activity, Code, MessageCircle, AlertTriangle, Play, Pause, Flame, Search, Layers, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [state, setState] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [globalPlayState, setGlobalPlayState] = useState(true);
  const [isWubbleActive, setIsWubbleActive] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const sid = Math.random().toString(36).substring(2, 9);
    setSessionId(sid);
    
    fetch('http://localhost:3001/api/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid })
    })
      .then(r => r.json())
      .then(data => {
        setState(data.state);
        if (data.logs) setLogs(data.logs);
      })
      .catch(err => console.error("Could not reach backend:", err));
  }, []);

  // Poll for state and logs updates dynamically
  useEffect(() => {
    if (!sessionId) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setIsWubbleActive(true);
          setTimeout(() => setIsWubbleActive(false), 2000); 
          setState(data.state);
          if (data.logs) setLogs(data.logs);
        }
      } catch (err) {
        // Silently catch fetch errors to avoid terminal spam when backend restarts
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const triggerEvent = async (eventName: string) => {
    if (!sessionId) return;
    setIsLoading(true);
    
    try {
      const res = await fetch('http://localhost:3001/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, event: eventName })
      });
      const data = await res.json();
      setState(data.state);
      // logs will be caught by the next poll interval
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrapeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput || !sessionId) return;
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/vibe-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, url: urlInput })
      });
      const data = await res.json();
      setState(data.state);
      setUrlInput('');
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentColor = state?.color || '#4b5563';

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div 
        className="fixed top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-2000"
        style={{ backgroundColor: currentColor }}
      />
      
      {/* Top Header */}
      <header className="relative z-20 flex justify-between items-center px-8 py-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center space-x-2">
            <Radio className="w-6 h-6 text-blue-500" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">Wubble-Conductor</span>
          </h1>
          <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-mono">Real-Time Audio Orchestrator • WAM Engine</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className={`w-2 h-2 rounded-full ${isWubbleActive ? 'bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs font-mono">{isWubbleActive ? 'Wubble API Syncing' : 'Awaiting Connection'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex flex-col lg:flex-row p-6 gap-6 h-[calc(100vh-180px)] overflow-hidden">
        
        {/* Left Column: Visualizer & Controls */}
        <div className="flex-1 flex flex-col overflow-y-auto pr-2 space-y-6">
          
          {/* Hero Section */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 h-[350px]">
            <div className="flex-1 flex flex-col justify-center h-full">
               <p className="text-xs font-mono font-semibold tracking-widest uppercase mb-2" style={{ color: currentColor }}>
                  State: {state?.current_vibe || 'INITIALIZING'}
                </p>
                <h2 className="text-4xl font-bold mb-4 leading-tight">Adaptive Social Data<br/>Orchestration</h2>
                <div className="flex items-center space-x-4 text-sm text-white/50 bg-black/30 w-fit rounded-lg px-4 py-2 border border-white/5">
                  <span className="flex items-center space-x-2"><Layers className="w-4 h-4"/> <span>{state?.tempo || '--'} BPM Target</span></span>
                </div>
            </div>
            
            {/* The Vibe Orb component */}
            <div className="shrink-0 scale-90 sm:scale-100">
               <VibeOrb vibe={state?.current_vibe || 'idle'} tempo={state?.tempo} />
            </div>
          </div>

          {/* Integration Modifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <EventButton icon={<MessageCircle />} label="Focus" desc="Wubble Chat Calm" onClick={() => triggerEvent('CHAT_CALM')} active={state?.current_vibe === 'focus'} loading={isLoading} />
            <EventButton icon={<Flame />} label="Hype" desc="Wubble Chat Spike" onClick={() => triggerEvent('CHAT_HYPE')} active={state?.current_vibe === 'hype'} loading={isLoading} />
            <EventButton icon={<Code />} label="Flow" desc="Dev Mode Detected" onClick={() => triggerEvent('USER_CODING')} active={state?.current_vibe === 'flow'} loading={isLoading} />
            <EventButton icon={<AlertTriangle />} label="Error" desc="System Anomalies" onClick={() => triggerEvent('SYSTEM_ERROR')} active={state?.current_vibe === 'warning'} loading={isLoading} />
          </div>

          {/* Janitor Edge URL Input */}
          <form onSubmit={scrapeUrl} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center mb-10 lg:mb-0">
             <div className="flex items-center space-x-3 w-full md:w-auto">
               <div className="bg-blue-500/20 p-2 rounded-lg"><Search className="w-4 h-4 text-blue-400" /></div>
               <div>
                  <h3 className="text-sm font-semibold">Vision AI Ingestion</h3>
                  <p className="text-xs text-white/50 font-mono">Process a shared link context</p>
               </div>
             </div>
             <input 
                type="url" 
                placeholder="https://example.com"
                className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-white text-black px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 w-full md:w-auto shrink-0"
              >
                Scan Context
              </button>
          </form>

        </div>

        {/* Right Column: Context Terminal */}
        <div className="w-full lg:w-[400px] xl:w-[500px] h-full shrink-0">
          <ContextTerminal logs={logs} />
        </div>
        
      </div>

      {/* Bottom Sub-Nav Waveform / Music Controller */}
      <div className="relative z-30 h-24 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between px-8 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
         <div className="flex items-center space-x-6 w-1/4">
            <button 
              onClick={() => setGlobalPlayState(!globalPlayState)}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {globalPlayState ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-bold truncate shrink-0 max-w-[200px]">Wubble AI Mix Engine</p>
              <p className="text-xs text-white/50">{state?.tempo ? `${state.tempo} BPM Active` : 'Engine Idle'}</p>
            </div>
         </div>
         
         <div className="flex-1 flex justify-center max-w-2xl px-6">
            {/* Embedded Audio Engine Visualizer */}
             <AudioEngine 
                trackUrl={state?.track_url || null} 
                crossfadeDuration={state?.crossfade || 2500} 
                globalPlayState={globalPlayState} 
             />
         </div>

         <div className="w-1/4 hidden lg:flex justify-end pr-4">
             {/* Decorative waveforms */}
             <div className="flex items-end space-x-1 h-8 opacity-30">
               {[...Array(12)].map((_, i) => (
                 <motion.div 
                    key={i}
                    animate={{ height: globalPlayState && state ? [10, Math.random() * 30 + 10, 10] : 10 }}
                    transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" }}
                    className="w-1 bg-white rounded-t-sm"
                 />
               ))}
             </div>
         </div>
      </div>
    </main>
  );
}

function EventButton({ icon, label, desc, onClick, active, loading }: any) {
  return (
    <button 
      disabled={loading}
      onClick={onClick}
      className={`flex items-start space-x-4 p-4 rounded-xl border transition-all text-left group
        ${active ? 'bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent border-white/5 hover:bg-white/5'}
      `}
    >
      <div className={`p-2 rounded-lg transition-colors shrink-0 ${active ? 'bg-white text-black' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm">{label}</h3>
        <p className="text-xs text-white/50 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
