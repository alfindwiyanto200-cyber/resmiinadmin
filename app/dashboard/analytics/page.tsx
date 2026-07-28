import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics — Resmiin Admin' };

export default function AnalyticsPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Data pengunjung dari Google Analytics 4</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Visitor', value: '—', icon: '👥' },
          { label: 'Page View', value: '—', icon: '📄' },
          { label: 'Bounce Rate', value: '—', icon: '↩️' },
          { label: 'Avg Session', value: '—', icon: '⏱️' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card" style={{ flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '28px' }}>{stat.icon}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="card card-body" style={{ textAlign: 'center', padding: '48px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Hubungkan Google Analytics 4</h2>
        <p style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '400px', margin: '0 auto 20px' }}>
          Tambahkan Google Analytics Measurement ID ke pengaturan untuk melihat data pengunjung real-time, grafik harian, dan laporan traffic.
        </p>
        <a href="/dashboard/settings" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Buka Pengaturan
        </a>
      </div>
    </>
  );
}
