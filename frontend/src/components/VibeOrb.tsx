"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type VibeState = 'focus' | 'hype' | 'warning' | 'idle';

interface VibeOrbProps {
  vibe: VibeState;
  tempo?: number;
}

export default function VibeOrb({ vibe, tempo = 80 }: VibeOrbProps) {
  const [color, setColor] = useState('#3b82f6');
  const [shadow, setShadow] = useState('0px 0px 40px #3b82f6');

  useEffect(() => {
    switch (vibe) {
      case 'focus': // Blue pulse
        setColor('#3b82f6');
        setShadow('0px 0px 60px rgba(59, 130, 246, 0.6)');
        break;
      case 'hype': // Orange rapid
        setColor('#f97316');
        setShadow('0px 0px 80px rgba(249, 115, 22, 0.8)');
        break;
      case 'warning': // Purple erratic
        setColor('#a855f7');
        setShadow('0px 0px 100px rgba(168, 85, 247, 0.9)');
        break;
      case 'idle':
      default:
        setColor('#4b5563');
        setShadow('0px 0px 20px rgba(75, 85, 99, 0.3)');
        break;
    }
  }, [vibe]);

  // Tempo adjustment for the pulsing animation
  const duration = 60 / Math.max(tempo, 60);

  // Define the pulse animation depending on the vibe
  let animateProps = {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
  };

  if (vibe === 'warning') {
    animateProps = {
      scale: [1, 1.2, 0.9, 1.3, 1],
      opacity: [1, 0.6, 1, 0.4, 1],
    };
  } else if (vibe === 'hype') {
    animateProps = {
      scale: [1, 1.05, 1],
      opacity: [0.9, 1, 0.9],
    };
  }

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      <motion.div
        animate={animateProps}
        transition={{
          repeat: Infinity,
          duration: vibe === 'warning' ? 0.3 : duration,
          ease: vibe === 'warning' ? "circInOut" : "easeInOut",
        }}
        className="absolute w-48 h-48 rounded-full blur-2xl z-0"
        style={{
          backgroundColor: color,
          boxShadow: shadow,
        }}
      />
      
      {/* Structural Orb */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
        className="relative z-10 w-40 h-40 rounded-full border border-white/20 backdrop-blur-md overflow-hidden bg-white/5 shadow-inner"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, ${color}20 60%, transparent 100%)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 opacity-50" />
      </motion.div>
    </div>
  );
}
