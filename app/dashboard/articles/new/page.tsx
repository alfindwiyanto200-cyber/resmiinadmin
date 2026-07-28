import { prisma } from '@/lib/db';
import ArticleForm from '@/components/articles/ArticleForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Artikel Baru — Resmiin Admin' };

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
    prisma.tag.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
  ]);

  return (
    <ArticleForm
      categories={categories}
      tags={tags}
    />
  );
}
