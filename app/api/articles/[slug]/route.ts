import { prisma } from '@/lib/db';

interface Context {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: Context) {
  try {
    const { slug } = await params;
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
    });

    if (!article || article.status !== 'PUBLISHED') {
      return Response.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    return Response.json({ article });
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return Response.json({ error: 'Gagal mengambil artikel' }, { status: 500 });
  }
}
