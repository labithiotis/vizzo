import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import appCss from '../app.css?url';

const SITE_TITLE = 'Vizzo — Render charts, anywhere.';
const SITE_DESCRIPTION =
  'A lightweight CLI and SDK that renders Grammar of Graphics chart definitions to SVG, PNG, and WebP — built for agents, bots, and CI. No browser, no Playwright, no Canvas.';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: SITE_TITLE },
      { name: 'description', content: SITE_DESCRIPTION },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },
      { property: 'og:site_name', content: 'Vizzo' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SITE_TITLE },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      { name: 'theme-color', content: '#fbf9f4', media: '(prefers-color-scheme: light)' },
      { name: 'theme-color', content: '#0e1013', media: '(prefers-color-scheme: dark)' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap',
      },
    ],
  }),
  component: Outlet,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scheme-light-dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-paper font-sans text-ink antialiased dark:bg-paper-dark dark:text-ink-dark">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
