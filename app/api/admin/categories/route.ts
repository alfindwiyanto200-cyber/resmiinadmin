import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
    return Response.json({ categories });
  } catch {
    return Response.json({ error: 'Gagal mengambil kategori' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, slug, description } = await request.json();
    if (!name || !slug) return Response.json({ error: 'Nama dan slug wajib diisi' }, { status: 400 });

    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) return Response.json({ error: 'Slug sudah digunakan' }, { status: 400 });

    const category = await prisma.category.create({ data: { name, slug, description } });
    await logActivity({ userId: session.id, action: 'CREATE_CATEGORY', target: name, targetId: category.id });
    return Response.json({ category }, { status: 201 });
  } catch {
    return Response.json({ error: 'Gagal membuat kategori' }, { status: 500 });
  }
}
