import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="admin-layout">
      <Sidebar user={session} />
      <div className="admin-main">
        <Header user={session} />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
