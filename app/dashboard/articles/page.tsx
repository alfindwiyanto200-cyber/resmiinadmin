import { prisma } from '@/lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';
import DeleteArticleButton from '@/components/articles/DeleteArticleButton';

export const metadata: Metadata = { title: 'Artikel — Resmiin Admin' };

interface Props {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}

const STATUS_TABS = [
  { label: 'Semua', value: '' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Terjadwal', value: 'SCHEDULED' },
  { label: 'Arsip', value: 'ARCHIVED' },
  { label: 'Sampah', value: 'TRASH' },
];

export default async function ArticlesPage({ searchParams }: Props) {
  const { status = '', page = '1', q = '' } = await searchParams;
  const currentPage = parseInt(page) || 1;
  const pageSize = 15;

  const where = {
    ...(status && { status: status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' | 'TRASH' }),
    ...(q && { title: { contains: q, mode: 'insensitive' as const } }),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      include: { author: { select: { name: true } }, category: { select: { name: true } } },
    }).catch(() => []),
    prisma.article.count({ where }).catch(() => 0),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Artikel</h1>
          <p className="page-subtitle">{total} artikel total</p>
        </div>
        <Link href="/dashboard/articles/new" className="btn btn-primary">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Artikel Baru
        </Link>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '0' }}>
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/articles${tab.value ? `?status=${tab.value}` : ''}`}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: status === tab.value ? '#2563eb' : '#6b7280',
              borderBottom: status === tab.value ? '2px solid #2563eb' : '2px solid transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Articles Table */}
      <div className="card">
        {articles.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📄</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Tidak ada artikel</p>
            <p style={{ fontSize: '13px' }}>
              {q ? `Tidak ada hasil untuk "${q}"` : 'Mulai dengan membuat artikel pertama Anda.'}
            </p>
            <Link href="/dashboard/articles/new" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
              Buat Artikel Pertama
            </Link>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Status</th>
                    <th>Kategori</th>
                    <th>Penulis</th>
                    <th>Tanggal</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id}>
                      <td style={{ maxWidth: '320px' }}>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '13.5px', marginBottom: '2px' }}>
                          {article.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                          /{article.slug}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={article.status} />
                      </td>
                      <td style={{ color: '#6b7280', fontSize: '13px' }}>
                        {article.category?.name || '—'}
                      </td>
                      <td style={{ color: '#6b7280', fontSize: '13px' }}>
                        {article.author?.name || '—'}
                      </td>
                      <td style={{ color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(article.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Link href={`/dashboard/articles/${article.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                          <DeleteArticleButton articleId={article.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Menampilkan {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} dari {total} artikel
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {currentPage > 1 && (
                    <Link href={`/dashboard/articles?page=${currentPage - 1}${status ? `&status=${status}` : ''}`} className="btn btn-secondary btn-sm">← Prev</Link>
                  )}
                  {currentPage < totalPages && (
                    <Link href={`/dashboard/articles?page=${currentPage + 1}${status ? `&status=${status}` : ''}`} className="btn btn-secondary btn-sm">Next →</Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
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

