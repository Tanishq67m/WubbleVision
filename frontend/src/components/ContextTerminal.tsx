"use client";

import { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  timestamp: string;
  message: string;
}

interface ContextTerminalProps {
  logs: LogEntry[];
}

export default function ContextTerminal({ logs = [] }: ContextTerminalProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever logs update
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full w-full bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center space-x-2 px-4 py-3 bg-white/5 border-b border-white/10 shadow-sm">
        <Terminal className="w-4 h-4 text-white/50" />
        <h3 className="text-xs font-mono font-semibold tracking-wider text-white/70 uppercase">Context Terminal</h3>
        <div className="flex-1" />
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 opacity-50" />
          <span className="w-2 h-2 rounded-full bg-yellow-400 opacity-50" />
          <span className="w-2 h-2 rounded-full bg-green-400 opacity-50" />
        </div>
      </div>
      
      {/* Terminal View */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs sm:text-sm space-y-2 relative">
        {logs.length === 0 ? (
          <p className="text-white/20 italic text-center mt-10">Awaiting Wubble Context Stream...</p>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log, index) => {
              const time = new Date(log.timestamp).toLocaleTimeString([], { hour12: false });
              
              // Formatting styles based on content
              let messageColor = 'text-green-400';
              if (log.message.includes('Error') || log.message.includes('❌') || log.message.includes('⚠️')) {
                messageColor = 'text-red-400';
              } else if (log.message.includes('Hype') || log.message.includes('⚡') || log.message.includes('🧠')) {
                messageColor = 'text-yellow-400';
              } else if (log.message.includes('Wubble AI') || log.message.includes('🎵') || log.message.includes('✅')) {
                messageColor = 'text-blue-400';
              }

              return (
                <motion.div
                  key={log.timestamp + index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex space-x-3 items-start"
                >
                  <span className="text-white/30 shrink-0">[{time}]</span>
                  <span className={`${messageColor} font-medium tracking-tight break-all`}>
                    {log.message}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
