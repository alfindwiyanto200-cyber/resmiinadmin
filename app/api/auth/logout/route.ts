import { cookies } from 'next/headers';
import { deleteSession, getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (token) {
      const session = await getSession();
      if (session) {
        await logActivity({
          userId: session.id,
          action: 'LOGOUT',
          target: session.email,
        });
      }
      await deleteSession(token);
      cookieStore.delete('admin_session');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json({ error: 'Logout gagal' }, { status: 500 });
  }
}
