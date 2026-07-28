import { prisma } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Tag — Resmiin Admin' };

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  }).catch(() => []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tag</h1>
          <p className="page-subtitle">{tags.length} tag</p>
        </div>
        <button className="btn btn-primary">+ Tambah Tag</button>
      </div>

      <div className="card">
        {tags.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏷️</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>Belum ada tag</p>
          </div>
        ) : (
          <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {tags.map((tag) => (
              <div key={tag.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#f3f4f6', border: '1px solid #e5e7eb',
                borderRadius: '20px', padding: '6px 14px',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{tag.name}</span>
                <span style={{ fontSize: '11px', color: '#9ca3af', background: 'white', borderRadius: '10px', padding: '1px 6px' }}>
                  {tag._count.articles}
                </span>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '14px', padding: '0 2px' }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
