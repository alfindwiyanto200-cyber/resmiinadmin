import { prisma } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'SEO Dashboard — Resmiin Admin' };

export default async function SeoPage() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true, title: true, slug: true,
      seoTitle: true, seoDescription: true, focusKeyword: true,
      canonicalUrl: true, ogTitle: true, schemaMarkup: true, featuredImage: true,
    },
    orderBy: { updatedAt: 'desc' },
  }).catch(() => []);

  const issues = articles.map((art) => {
    const checks = [
      { label: 'SEO Title', ok: !!art.seoTitle && art.seoTitle.length >= 30 && art.seoTitle.length <= 60 },
      { label: 'SEO Description', ok: !!art.seoDescription && art.seoDescription.length >= 70 && art.seoDescription.length <= 160 },
      { label: 'Focus Keyword', ok: !!art.focusKeyword },
      { label: 'Canonical URL', ok: !!art.canonicalUrl },
      { label: 'Open Graph', ok: !!art.ogTitle },
      { label: 'Schema Markup', ok: !!art.schemaMarkup },
      { label: 'Featured Image', ok: !!art.featuredImage },
    ];
    const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
    return { ...art, checks, score };
  });

  const avgScore = issues.length > 0 ? Math.round(issues.reduce((a, b) => a + b.score, 0) / issues.length) : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">SEO Dashboard</h1>
          <p className="page-subtitle">Pantau dan optimalkan SEO seluruh artikel</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: avgScore >= 80 ? '#dcfce7' : avgScore >= 50 ? '#fef9c3' : '#fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 800,
            color: avgScore >= 80 ? '#16a34a' : avgScore >= 50 ? '#d97706' : '#dc2626',
          }}>
            {avgScore}%
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Rata-rata SEO Score</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{articles.length} artikel published</div>
          </div>
        </div>
      </div>

      <div className="card">
        {issues.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#374151' }}>Belum ada artikel published</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Artikel</th>
                  <th>Score</th>
                  <th>SEO Title</th>
                  <th>Description</th>
                  <th>Keyword</th>
                  <th>Canonical</th>
                  <th>OG</th>
                  <th>Schema</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((art) => (
                  <tr key={art.id}>
                    <td style={{ maxWidth: '220px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {art.title}
                      </div>
                    </td>
                    <td>
                      <div style={{
                        fontSize: '13px', fontWeight: 800,
                        color: art.score >= 80 ? '#16a34a' : art.score >= 50 ? '#d97706' : '#dc2626',
                      }}>
                        {art.score}%
                      </div>
                    </td>
                    {art.checks.map((check, i) => (
                      <td key={i} style={{ textAlign: 'center' }}>
                        {check.ok ? '✅' : '❌'}
                      </td>
                    ))}
                    <td>
                      <a href={`/dashboard/articles/${art.id}/edit?tab=seo`} className="btn btn-secondary btn-sm">
                        Fix SEO
                      </a>
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
