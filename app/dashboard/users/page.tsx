import { prisma } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pengguna — Resmiin Admin' };

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  AUTHOR: 'Author',
  VIEWER: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: '#7c3aed',
  ADMIN: '#1d4ed8',
  EDITOR: '#059669',
  AUTHOR: '#d97706',
  VIEWER: '#6b7280',
};

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { articles: true } } },
  }).catch(() => []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengguna</h1>
          <p className="page-subtitle">{users.length} pengguna terdaftar</p>
        </div>
        <button className="btn btn-primary">+ Tambah Pengguna</button>
      </div>

      <div className="card">
        {users.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>Belum ada pengguna</p>
            <p style={{ fontSize: '13px' }}>Jalankan db:seed untuk membuat akun admin pertama.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Role</th>
                  <th>Artikel</th>
                  <th>Bergabung</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: '#dbeafe', color: '#1d4ed8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 700, flexShrink: 0,
                        }}>
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                        background: `${ROLE_COLORS[user.role]}20`,
                        color: ROLE_COLORS[user.role],
                      }}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{user._count.articles}</td>
                    <td style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(user.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm">Edit</button>
                        <button className="btn btn-danger btn-sm">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
