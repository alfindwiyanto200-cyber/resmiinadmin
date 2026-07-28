import { uploadToCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string || '';
    const caption = formData.get('caption') as string || '';
    const folder = formData.get('folder') as string || 'resmiin';

    if (!file) return Response.json({ error: 'File tidak ditemukan' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer, { folder });

    const media = await prisma.media.create({
      data: {
        fileName: file.name,
        url: result.url,
        publicId: result.publicId,
        alt: alt || file.name.replace(/\.[^.]+$/, ''),
        caption,
        width: result.width,
        height: result.height,
        size: result.size,
        mimeType: file.type,
        folder,
      },
    });

    await logActivity({ userId: session.id, action: 'UPLOAD_MEDIA', target: file.name, targetId: media.id });

    return Response.json({ media }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Gagal mengupload file' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 24;

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.media.count(),
    ]);

    return Response.json({ media, total, pages: Math.ceil(total / limit) });
  } catch {
    return Response.json({ error: 'Gagal mengambil media' }, { status: 500 });
  }
}
