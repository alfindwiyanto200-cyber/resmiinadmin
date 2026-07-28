import { prisma } from '@/lib/db';
import Link from 'next/link';

async function getDashboardStats() {
  try {
    const [totalArticles, publishedArticles, draftArticles, totalCategories, totalTags, recentArticles, recentActivity] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.article.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { author: { select: { name: true } }, category: { select: { name: true } } },
      }),
      prisma.activityLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ]);
    return { totalArticles, publishedArticles, draftArticles, totalCategories, totalTags, recentArticles, recentActivity };
  } catch {
    return { totalArticles: 0, publishedArticles: 0, draftArticles: 0, totalCategories: 0, totalTags: 0, recentArticles: [], recentActivity: [] };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Selamat datang di Resmiin Admin CMS</p>
        </div>
        <Link href="/dashboard/articles/new" className="btn btn-primary">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Artikel Baru
        </Link>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="Total Artikel"
          value={stats.totalArticles}
          icon="📄"
          color="#dbeafe"
          iconColor="#1d4ed8"
          href="/dashboard/articles"
        />
        <StatCard
          label="Artikel Tayang"
          value={stats.publishedArticles}
          icon="✅"
          color="#dcfce7"
          iconColor="#16a34a"
          href="/dashboard/articles?status=PUBLISHED"
        />
        <StatCard
          label="Draft"
          value={stats.draftArticles}
          icon="📝"
          color="#fef9c3"
          iconColor="#b45309"
          href="/dashboard/articles?status=DRAFT"
        />
        <StatCard
          label="Kategori"
          value={stats.totalCategories}
          icon="📂"
          color="#f3e8ff"
          iconColor="#9333ea"
          href="/dashboard/categories"
        />
        <StatCard
          label="Tag"
          value={stats.totalTags}
          icon="🏷️"
          color="#fee2e2"
          iconColor="#dc2626"
          href="/dashboard/tags"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Recent Articles */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Artikel Terbaru</h2>
            <Link href="/dashboard/articles" className="btn btn-ghost btn-sm">Lihat semua</Link>
          </div>
          <div style={{ overflow: 'hidden' }}>
            {stats.recentArticles.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                Belum ada artikel. <Link href="/dashboard/articles/new" style={{ color: '#2563eb' }}>Buat artikel pertama</Link>
              </div>
            ) : (
              stats.recentArticles.map((article) => (
                <div key={article.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 20px', borderBottom: '1px solid #f3f4f6',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {article.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                      {article.category?.name || 'Tanpa Kategori'} • {article.author?.name || 'Unknown'}
                    </div>
                  </div>
                  <StatusBadge status={article.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Aktivitas Terbaru</h2>
          </div>
          <div style={{ overflow: 'hidden' }}>
            {stats.recentActivity.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                Belum ada aktivitas.
              </div>
            ) : (
              stats.recentActivity.map((log) => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 20px', borderBottom: '1px solid #f3f4f6',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, color: '#1d4ed8', flexShrink: 0,
                  }}>
                    {log.user?.name?.substring(0, 1) || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', color: '#374151' }}>
                      <strong>{log.user?.name || 'System'}</strong>{' '}
                      {formatAction(log.action)}{' '}
                      {log.target && <em style={{ color: '#6b7280' }}>{log.target}</em>}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                      {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-header">
          <h2 className="card-title">Aksi Cepat</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link href="/dashboard/articles/new" className="btn btn-primary">📝 Tulis Artikel Baru</Link>
            <Link href="/dashboard/categories" className="btn btn-secondary">📂 Kelola Kategori</Link>
            <Link href="/dashboard/media" className="btn btn-secondary">🖼️ Upload Media</Link>
            <Link href="/dashboard/users" className="btn btn-secondary">👥 Kelola Pengguna</Link>
            <Link href="/dashboard/seo" className="btn btn-secondary">🔍 Cek SEO</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, icon, color, iconColor, href }: {
  label: string; value: number; icon: string; color: string; iconColor: string; href: string;
}) {
  return (
    <Link href={href} className="stat-card" style={{ textDecoration: 'none' }}>
      <div className="stat-icon" style={{ background: color }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value.toLocaleString()}</div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: 'badge-published',
    DRAFT: 'badge-draft',
    SCHEDULED: 'badge-scheduled',
    ARCHIVED: 'badge-archived',
    TRASH: 'badge-trash',
  };
  const labels: Record<string, string> = {
    PUBLISHED: 'Tayang',
    DRAFT: 'Draft',
    SCHEDULED: 'Terjadwal',
    ARCHIVED: 'Arsip',
    TRASH: 'Sampah',
  };
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{labels[status] || status}</span>;
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    LOGIN: 'masuk ke sistem',
    LOGOUT: 'keluar dari sistem',
    CREATE_ARTICLE: 'membuat artikel',
    UPDATE_ARTICLE: 'mengedit artikel',
    DELETE_ARTICLE: 'menghapus artikel',
    PUBLISH_ARTICLE: 'menerbitkan artikel',
    UNPUBLISH_ARTICLE: 'mencabut artikel',
    RESTORE_ARTICLE: 'memulihkan artikel',
    UPLOAD_MEDIA: 'mengupload media',
    DELETE_MEDIA: 'menghapus media',
    CREATE_CATEGORY: 'membuat kategori',
    UPDATE_CATEGORY: 'mengedit kategori',
    DELETE_CATEGORY: 'menghapus kategori',
    CREATE_USER: 'membuat pengguna',
    UPDATE_USER: 'mengedit pengguna',
    DELETE_USER: 'menghapus pengguna',
    BACKUP: 'melakukan backup',
  };
  return map[action] || action.toLowerCase().replace(/_/g, ' ');
}
