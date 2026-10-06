import { createFileRoute, notFound } from '@tanstack/react-router';
import { DocArticle } from '~/components/docs/DocArticle';

export const Route = createFileRoute('/docs/$page')({
  loader: async ({ params }) => {
    const { findDocPage } = await import('~/documentation');
    const page = findDocPage(params.page);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.label || 'Documentation'} | Vizzo` },
      { name: 'description', content: loaderData?.description || 'Vizzo chart rendering documentation.' },
    ],
  }),
  component: Guide,
});

function Guide() {
  return <DocArticle page={Route.useLoaderData()} />;
}
