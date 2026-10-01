import handler from '@tanstack/react-start/server-entry';
import { renderRequest } from './render';

export default {
  fetch(request, env) {
    if (new URL(request.url).pathname === '/' && (request.method === 'POST' || request.method === 'OPTIONS')) {
      return renderRequest(request, env.RENDER_RATE_LIMIT);
    }
    return handler.fetch(request);
  },
} satisfies ExportedHandler<Env>;
