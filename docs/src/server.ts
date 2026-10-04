import { renderRequest } from './render';

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    if (
      (pathname === '/' && (request.method === 'POST' || request.method === 'OPTIONS')) ||
      (pathname === '/x' && request.method === 'GET')
    ) {
      return renderRequest(request, env.RENDER_RATE_LIMIT);
    }
    const { default: handler } = await import('@tanstack/react-start/server-entry');
    return handler.fetch(request);
  },
} satisfies ExportedHandler<Env>;
