import { env } from 'cloudflare:workers';
import { createFileRoute } from '@tanstack/react-router';
import { renderRequest } from '~/render';

export const Route = createFileRoute('/x')({
  server: {
    handlers: {
      GET: ({ request }) => renderRequest(request, env.RENDER_RATE_LIMIT),
      ANY: () => new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } }),
    },
  },
});
