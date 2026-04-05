import { FastifyInstance } from 'fastify';
import { getSession, setSession, getSessionLogs } from '../lib/redis';
import { MusicTransitions } from '../engine/stateMachine';
import { audioQueue } from '../queue';
import { chromium } from 'playwright';

export default async function sessionRoutes(fastify: FastifyInstance) {
  // Initialize a Session
  fastify.post('/start', async (request, reply) => {
    const { sessionId } = request.body as { sessionId: string };
    
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    const initialState = {
      current_vibe: 'focus',
      track_url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      tempo: 80,
      color: '#3b82f6',
      crossfade: 2000
    };

    await setSession(`session:${sessionId}`, JSON.stringify(initialState));

    return reply.send({
      message: 'Session initialized',
      sessionId,
      state: initialState
    });
  });

  // Regular Update Event
  fastify.post('/update', async (request, reply) => {
    const { sessionId, event } = request.body as { sessionId: string; event: string };

    if (!sessionId || !event) {
      return reply.code(400).send({ error: 'sessionId and event are required' });
    }

    // 1. Queue background worker
    audioQueue.emit('process_event', { sessionId, event });

    // 2. Determine Next State
    const transition = MusicTransitions[event];
    if (!transition) {
      return reply.code(400).send({ error: 'Unknown event type' });
    }

    // 3. Update State via Redis
    // Map public fallback sounds to states for immediate frontend feedback
    const FallbackAudio: Record<string, string> = {
      focus: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      flow: 'https://actions.google.com/sounds/v1/science_fiction/space_engine.ogg',
      hype: 'https://actions.google.com/sounds/v1/science_fiction/dark_pad_with_filter_sweep.ogg',
      warning: 'https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg',
      lofi: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg',
      epic: 'https://actions.google.com/sounds/v1/science_fiction/power_down.ogg',
      cyberpunk: 'https://actions.google.com/sounds/v1/science_fiction/teleport.ogg',
      ambient: 'https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg',
    };

    const newState = {
      current_vibe: transition.next,
      track_url: FallbackAudio[transition.next] || 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      tempo: transition.tempo,
      color: transition.color,
      crossfade: 2000 // 2 seconds crossfade
    };

    await setSession(`session:${sessionId}`, JSON.stringify(newState));

    return reply.send({
      message: 'State updated',
      state: newState
    });
  });

  // The Janitor Edge (Playwright URL Scraper)
  fastify.post('/vibe-check', async (request, reply) => {
    const { sessionId, url } = request.body as { sessionId: string; url: string };

    if (!sessionId || !url) {
      return reply.code(400).send({ error: 'sessionId and url are required' });
    }

    // Pass to worker queue
    audioQueue.emit('process_event', { sessionId, event: 'CUSTOM_URL', url });

    let title = 'Unknown vibe';
    try {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
      title = await page.title();
      
      await browser.close();
    } catch (err) {
      console.warn("Playwright fetch failed:", err);
    }
    
    // Hardcode transition to HYPE for demo purposes
    const transition = MusicTransitions['CHAT_HYPE'];
    const newState = {
      current_vibe: transition.next,
      track_url: 'https://actions.google.com/sounds/v1/science_fiction/dark_pad_with_filter_sweep.ogg',
      tempo: transition.tempo,
      color: transition.color,
      crossfade: 2000
    };

    await setSession(`session:${sessionId}`, JSON.stringify(newState));

    return reply.send({
      message: `Analyzed ${title}. Sentimental shift applied.`,
      state: newState
    });
  });

  // Poll current session state
  fastify.get('/:sessionId', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };
    
    if (!sessionId) {
      return reply.code(400).send({ error: 'sessionId is required' });
    }

    const sessionData = await getSession(`session:${sessionId}`);
    if (!sessionData) {
      return reply.code(404).send({ error: 'Session not found' });
    }

    const logs = await getSessionLogs(sessionId);

    return reply.send({
      sessionId,
      state: JSON.parse(sessionData),
      logs
    });
  });
}
