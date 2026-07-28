import { prisma } from '@/lib/db';
import { getSession, hasPermission } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true, slug: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });
    if (!article) return Response.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    return Response.json({ article });
  } catch {
    return Response.json({ error: 'Gagal mengambil artikel' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return Response.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });

    // Authors can only edit their own articles
    if (session.role === 'AUTHOR' && article.authorId !== session.id) {
      return Response.json({ error: 'Anda hanya bisa mengedit artikel milik sendiri' }, { status: 403 });
    }

    const body = await request.json();
    const { tagIds, status, ...rest } = body;

    const wasPublished = article.status === 'PUBLISHED';
    const nowPublishing = status === 'PUBLISHED';

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...rest,
        status,
        publishedAt: nowPublishing && !wasPublished ? new Date() : article.publishedAt,
        tags: tagIds !== undefined ? {
          deleteMany: {},
          create: tagIds.map((tagId: string) => ({ tagId })),
        } : undefined,
      },
    });

    await logActivity({
      userId: session.id,
      action: nowPublishing && !wasPublished ? 'PUBLISH_ARTICLE' : 'UPDATE_ARTICLE',
      target: updated.title,
      targetId: updated.id,
    });

    return Response.json({ article: updated });
  } catch (error) {
    console.error('Update article error:', error);
    return Response.json({ error: 'Gagal mengupdate artikel' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!hasPermission(session.role, ['ADMIN', 'SUPER_ADMIN'])) {
      return Response.json({ error: 'Tidak memiliki izin' }, { status: 403 });
    }

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return Response.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });

    // Move to trash instead of permanent delete (unless already in trash)
    if (article.status === 'TRASH') {
      await prisma.article.delete({ where: { id } });
      await logActivity({ userId: session.id, action: 'DELETE_ARTICLE', target: article.title, targetId: id });
    } else {
      await prisma.article.update({ where: { id }, data: { status: 'TRASH' } });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Gagal menghapus artikel' }, { status: 500 });
  }
}
