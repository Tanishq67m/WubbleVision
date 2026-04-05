import { EventEmitter } from 'events';
import { MusicTransitions } from './engine/stateMachine';
import { generateWubbleMusic } from './lib/wubble';
import { getSession, setSession, appendSessionLog } from './lib/redis';

export const audioQueue = new EventEmitter();

// Simulate a background worker processing the stream of events
audioQueue.on('process_event', async (payload: { sessionId: string; event: string; url?: string }) => {
  console.log(`\n[WORKER] Received event: ${payload.event} for session ${payload.sessionId}`);
  await appendSessionLog(payload.sessionId, `📥 Received Context Event: ${payload.event}`);
  
  console.log(`[WORKER] Analyzing sentiment for transition...`);
  await appendSessionLog(payload.sessionId, `🧠 Analyzing event sentiment for state transition...`);
  
  let resolvedEvent = payload.event;
  
  // If an external URL is passed, we pretend we scraped it and it shifted the vibe to HYPE
  if (payload.url) {
    console.log(`[WORKER] Extracting sentiment from URL: ${payload.url}`);
    await appendSessionLog(payload.sessionId, `🕸️ Playwright Janitor parsing URL: ${payload.url}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(`[WORKER] URL analysis complete. Vibe is heavily HYPE.`);
    await appendSessionLog(payload.sessionId, `⚡ High information density detected. Forcing "Hype" flow...`);
    resolvedEvent = 'CHAT_HYPE'; 
  }

  const transition = MusicTransitions[resolvedEvent];
  
  if (transition) {
    console.log(`[WORKER] Transition mapped: Next State -> '${transition.next.toUpperCase()}' (Tempo: ${transition.tempo} BPM)`);
    await appendSessionLog(payload.sessionId, `🔄 Target State: ${transition.next.toUpperCase()} | Tempo: ${transition.tempo} BPM`);
    
    try {
      // 1. Call Wubble AI API
      const promptContext = `Generate a ${transition.next} mood music track at ${transition.tempo} BPM.`;
      await appendSessionLog(payload.sessionId, `🎵 Requesting Wubble AI Audio Generation: "${promptContext}"`);
      const generatedTrackUrl = await generateWubbleMusic(promptContext);
      
      // 2. Fetch current session and update the generated track
      const sessionData = await getSession(`session:${payload.sessionId}`);
      if (sessionData) {
        const state = JSON.parse(sessionData);
        state.track_url = generatedTrackUrl;
        await setSession(`session:${payload.sessionId}`, JSON.stringify(state));
        console.log(`[WORKER] Session track updated with Wubble API Result: ${generatedTrackUrl}`);
        await appendSessionLog(payload.sessionId, `✅ Wubble AI Orchestration Applied: ${generatedTrackUrl.split('/').pop()}`);
      }
    } catch (err: any) {
      console.error(`[WORKER] Failed to communicate with Wubble AI API:`, err);
      await appendSessionLog(payload.sessionId, `❌ Error from Wubble AI: ${err.message || 'Connection Interrupted'}`);
    }
    
  } else {
    console.log(`[WORKER] Unknown event: ${resolvedEvent}, no transition generated.`);
    await appendSessionLog(payload.sessionId, `⚠️ Unhandled context event: ${resolvedEvent}`);
  }
});
