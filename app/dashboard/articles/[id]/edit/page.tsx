import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ArticleForm from '@/components/articles/ArticleForm';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id }, select: { title: true } }).catch(() => null);
  return { title: `Edit: ${article?.title || 'Artikel'} — Resmiin Admin` };
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;

  const [article, categories, tags] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { tags: { select: { tagId: true } } },
    }).catch(() => null),
    prisma.category.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
    prisma.tag.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
  ]);

  if (!article) notFound();

  const initialData = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? '',
    content: article.content ?? '',
    featuredImage: article.featuredImage ?? '',
    categoryId: article.categoryId ?? '',
    status: article.status,
    featured: article.featured,
    seoTitle: article.seoTitle ?? '',
    seoDescription: article.seoDescription ?? '',
    focusKeyword: article.focusKeyword ?? '',
    canonicalUrl: article.canonicalUrl ?? '',
    ogTitle: article.ogTitle ?? '',
    ogDescription: article.ogDescription ?? '',
    ogImage: article.ogImage ?? '',
    twitterTitle: article.twitterTitle ?? '',
    twitterDescription: article.twitterDescription ?? '',
    twitterImage: article.twitterImage ?? '',
    schemaMarkup: article.schemaMarkup ?? '',
    publishedAt: article.publishedAt?.toISOString() ?? '',
    tagIds: article.tags.map((t) => t.tagId),
  };

  return (
    <ArticleForm
      initialData={initialData}
      categories={categories}
      tags={tags}
    />
  );
}
