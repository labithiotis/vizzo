import { createFileRoute } from '@tanstack/react-router';
import { DocArticle } from '~/components/docs/DocArticle';
import { docPages } from '~/documentation';

export const Route = createFileRoute('/docs/')({
  head: () => ({
    meta: [
      { title: 'Quick start | Vizzo' },
      {
        name: 'description',
        content:
          'Render a TanStack Charts definition as an image with the CLI, an editable chart URL, or JSON over HTTP.',
      },
    ],
  }),
  component: Quickstart,
});

function Quickstart() {
  const page = docPages[0];
  return page ? <DocArticle page={page} /> : null;
}
