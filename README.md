# Wubble-Conductor (Adaptive Music Engine)

A command-center backend system and macOS-glassmorphic UI that bridges the **Wubble AI API** with real-time adaptive music generation. 

Instead of generating static tracks on demand, the system acts as a continuously running "Biological Interface". It queries the Wubble ML Music Generation API and orchestrates music dynamically based on the session state and contextual user/system events (e.g., coding activity, api errors, trending chat topics).

## 🏆 Project Description & The "Win" Factor

- **State-Driven Orchestration**: We aren't just playing music; we are managing a state machine. The backend transitions elegantly between `focus`, `flow`, `hype`, and `warning` based on precise events.
- **Wubble AI Orchestration**: Real-world integration with the Wubble AI Chat generation endpoints. Auto-mints keys seamlessly, gracefully polls for asynchronous generations, and implements fallback Edge Audio to guarantee 100% uptime latency during heavy API load.
- **Native Gapless Crossfading**: Rebuilt entirely with pure HTML5 React Audio references, the system transitions between concurrent audio states immediately and smoothly, providing zero latency between mood shifts without memory pool limits.
- **Event-Driven Context**: An architecture specifically designed to consume real-time streams like Wubble Chat or IDE webhooks, buffered through a simulated queue worker processing asynchronously.

## 🛠 Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS `beta`, Framer Motion, Vanilla HTML5 Audio cross-faders.
- **Backend / Engine**: Fastify (Node.js), TypeScript, Upstash Redis (for distributed state management).
- **AI Core**: Wubble AI Platform API.

## Setup Instructions

1. **Start the Backend Engine**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The engine will automatically generate an ephemeral API key for the Wubble ML Instance when you trigger an action.*

2. **Start the Frontend UI**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Experience the Biological Interface**
   Open `http://localhost:3000`. Interact with the dashboard and watch as the backend Worker queries the Wubble platform, processes the events, shifts the state, and instructs the browser to crossfade seamlessly into the new sonic environment.
