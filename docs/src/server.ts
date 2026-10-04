import { renderRequest } from './render';

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/' && (request.method === 'POST' || request.method === 'OPTIONS')) {
      return renderRequest(request, env.RENDER_RATE_LIMIT);
    }
    const { default: handler } = await import('@tanstack/react-start/server-entry');
    return handler.fetch(request);
  },
} satisfies ExportedHandler<Env>;
