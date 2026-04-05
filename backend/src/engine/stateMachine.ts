export type MusicState = 'focus' | 'flow' | 'hype' | 'warning' | 'lofi' | 'epic' | 'cyberpunk' | 'ambient';

export interface TransitionDetails {
  next: MusicState;
  tempo: number;
  color: string;
}

export interface TransitionMap {
  [key: string]: TransitionDetails;
}

export const MusicTransitions: TransitionMap = {
  'CHAT_CALM': { next: 'focus', tempo: 80, color: '#3b82f6' },      // Blue
  'USER_CODING': { next: 'flow', tempo: 95, color: '#10b981' },    // Green
  'CHAT_HYPE': { next: 'hype', tempo: 128, color: '#f97316' },     // Orange
  'SYSTEM_ERROR': { next: 'warning', tempo: 140, color: '#a855f7' }, // Purple
  'LATE_NIGHT': { next: 'lofi', tempo: 70, color: '#8b5cf6' },     // Purple
  'BOSS_FIGHT': { next: 'epic', tempo: 150, color: '#f97316' },    // Orange
  'HACK_MODE': { next: 'cyberpunk', tempo: 110, color: '#06b6d4' },// Cyan
  'MEDITATION': { next: 'ambient', tempo: 60, color: '#6366f1' }   // Indigo
};
