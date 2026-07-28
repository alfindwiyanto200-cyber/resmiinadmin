import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    const where = {
      status: 'PUBLISHED' as const,
      ...(category && {
        category: {
          slug: category,
        },
      }),
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return Response.json({
      articles,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return Response.json({ error: 'Gagal mengambil artikel' }, { status: 500 });
  }
}
