"use client";

import { useEffect, useRef, useState } from 'react';

interface AudioEngineProps {
  trackUrl: string | null;
  crossfadeDuration: number;
  globalPlayState: boolean;
}

export default function AudioEngine({ trackUrl, crossfadeDuration, globalPlayState }: AudioEngineProps) {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const volume = 0.8;

  useEffect(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.muted = !globalPlayState;
    }
  }, [globalPlayState]);

  useEffect(() => {
    if (!trackUrl) return;

    const newAudio = new Audio(trackUrl);
    newAudio.loop = true;
    newAudio.volume = 0;
    newAudio.muted = !globalPlayState;

    // Crossfade Logic - Instant Play bypasses buffering waits
    newAudio.play().then(() => {
      setIsPlaying(true);
      
      // Fade in new
      let vol = 0;
      const fadeStep = volume / (crossfadeDuration / 50);
      const fadeIn = setInterval(() => {
        vol += fadeStep;
        if (vol >= volume) {
          vol = volume;
          clearInterval(fadeIn);
        }
        newAudio.volume = vol;
      }, 50);

      // Fade out old
      if (currentAudioRef.current) {
        const oldAudio = currentAudioRef.current;
        let oldVol = oldAudio.volume;
        const fadeOutStep = oldVol / (crossfadeDuration / 50);
        const fadeOut = setInterval(() => {
          oldVol -= fadeOutStep;
          if (oldVol <= 0) {
            oldVol = 0;
            clearInterval(fadeOut);
            oldAudio.pause();
            oldAudio.src = '';
          }
          oldAudio.volume = oldVol;
        }, 50);
      }

      currentAudioRef.current = newAudio;
    }).catch(err => {
        // Silently handle autoplay blocks if user hasn't clicked page yet
        console.debug("Autoplay waiting for interaction...");
    });

    return () => {
      // Don't fully destroy immediately to allow crossfade to finish
    };
  }, [trackUrl, crossfadeDuration]);

  return (
    <div className="flex items-center space-x-2 w-full justify-end mt-4 text-xs text-white/50">
      <div className="flex items-center space-x-2">
        <span className="relative flex h-3 w-3">
          {isPlaying && globalPlayState && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying && globalPlayState ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
        </span>
        <span>{isPlaying && globalPlayState ? 'Audio Sync Active' : 'Waiting/Muted...'}</span>
      </div>
    </div>
  );
}
