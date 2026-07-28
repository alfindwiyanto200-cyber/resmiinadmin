import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
    return Response.json({ tags });
  } catch {
    return Response.json({ error: 'Gagal mengambil tag' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, slug } = await request.json();
    if (!name || !slug) return Response.json({ error: 'Nama dan slug wajib diisi' }, { status: 400 });

    const exists = await prisma.tag.findUnique({ where: { slug } });
    if (exists) return Response.json({ error: 'Slug sudah digunakan' }, { status: 400 });

    const tag = await prisma.tag.create({ data: { name, slug } });
    await logActivity({ userId: session.id, action: 'CREATE_TAG', target: name, targetId: tag.id });
    return Response.json({ tag }, { status: 201 });
  } catch {
    return Response.json({ error: 'Gagal membuat tag' }, { status: 500 });
  }
}
