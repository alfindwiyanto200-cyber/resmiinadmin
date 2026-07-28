import { prisma } from '@/lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Kategori — Resmiin Admin' };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  }).catch(() => []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kategori</h1>
          <p className="page-subtitle">{categories.length} kategori</p>
        </div>
        <button id="btn-add-category" className="btn btn-primary">
          + Tambah Kategori
        </button>
      </div>

      <div className="card">
        {categories.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📂</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>Belum ada kategori</p>
            <p style={{ fontSize: '13px' }}>Buat kategori pertama untuk mengelompokkan artikel.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Slug</th>
                  <th>Deskripsi</th>
                  <th>Artikel</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 700, color: '#111827' }}>{cat.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>{cat.slug}</td>
                    <td style={{ color: '#9ca3af', fontSize: '13px' }}>{cat.description || '—'}</td>
                    <td>
                      <Link href={`/dashboard/articles?categoryId=${cat.id}`}>
                        <span style={{ fontWeight: 700, color: '#2563eb' }}>{cat._count.articles}</span>
                      </Link>
                    </td>
                    <td style={{ textAlign: 'right' }}>
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
