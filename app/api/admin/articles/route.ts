import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const q = url.searchParams.get('q');

    const where = {
      ...(status && { status: status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' | 'TRASH' }),
      ...(q && { title: { contains: q, mode: 'insensitive' as const } }),
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, slug: true } },
          tags: { include: { tag: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return Response.json({ articles, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil artikel' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, slug, excerpt, content, featuredImage, categoryId, tagIds = [], status = 'DRAFT', featured, seoTitle, seoDescription, focusKeyword, canonicalUrl, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage, schemaMarkup, publishedAt } = body;

    if (!title || !slug) {
      return Response.json({ error: 'Judul dan slug wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      return Response.json({ error: 'Slug sudah digunakan' }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title, slug, excerpt, content, featuredImage,
        categoryId: categoryId || null,
        authorId: session.id,
        status,
        featured: featured ?? false,
        seoTitle, seoDescription, focusKeyword, canonicalUrl,
        ogTitle, ogDescription, ogImage,
        twitterTitle, twitterDescription, twitterImage,
        schemaMarkup,
        publishedAt: status === 'PUBLISHED' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
        tags: {
          create: tagIds.map((tagId: string) => ({ tagId })),
        },
      },
    });

    await logActivity({ userId: session.id, action: 'CREATE_ARTICLE', target: title, targetId: article.id });

    return Response.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Create article error:', error);
    return Response.json({ error: 'Gagal membuat artikel' }, { status: 500 });
  }
}
