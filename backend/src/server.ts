import Fastify from 'fastify';
import cors from '@fastify/cors';
import sessionRoutes from './routes/session';

const fastify = Fastify({
  logger: false // Keep console clean for our Worker logs
});

fastify.register(cors, { 
  origin: '*' 
});

fastify.register(sessionRoutes, { prefix: '/api' });

fastify.get('/', async (request, reply) => {
  return reply.send({ status: 'Wubble Adaptive Music Engine Operational' });
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`\n🚀 WAM Engine Server listening on port ${port}`);
    console.log(`⚡ State Machine / Redis connection initialized.\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
