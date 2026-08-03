import { prisma } from '@/lib/db';
import { createSession, verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/activity';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email) {
      return Response.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: 'Email tidak ditemukan' }, { status: 401 });
    }


    const token = await createSession(user.id, rememberMe);

    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
    });

    await logActivity({
      userId: user.id,
      action: 'LOGIN',
      target: user.email,
      details: `Login berhasil dari ${rememberMe ? 'remember me' : 'session biasa'}`,
    });

    return Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
