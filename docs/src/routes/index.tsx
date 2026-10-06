import { env } from 'cloudflare:workers';
import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '~/components/LandingPage';
import { renderRequest } from '~/render';

export const Route = createFileRoute('/')({
  component: LandingPage,
  server: {
    handlers: {
      POST: ({ request }) => renderRequest(request, env.RENDER_RATE_LIMIT),
      OPTIONS: ({ request }) => renderRequest(request, env.RENDER_RATE_LIMIT),
    },
  },
});
