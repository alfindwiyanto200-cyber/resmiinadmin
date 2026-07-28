import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pengaturan — Resmiin Admin' };

export default function SettingsPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengaturan</h1>
          <p className="page-subtitle">Konfigurasi sistem CMS Resmiin</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            Informasi Website
          </div>
          <div className="form-group">
            <label className="form-label">Nama Website</label>
            <input className="form-input" defaultValue="Resmiin" />
          </div>
          <div className="form-group">
            <label className="form-label">URL Website</label>
            <input className="form-input" defaultValue="https://resmiin.vercel.app" />
          </div>
          <div className="form-group">
            <label className="form-label">URL Admin</label>
            <input className="form-input" defaultValue="https://resmiin-admin.vercel.app" />
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Simpan</button>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            Google Analytics 4
          </div>
          <div className="form-group">
            <label className="form-label">Measurement ID</label>
            <input className="form-input" placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="form-hint">Dapatkan Measurement ID dari Google Analytics → Admin → Data Streams</div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Simpan</button>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            Cloudinary
          </div>
          <div className="form-group">
            <label className="form-label">Cloud Name</label>
            <input className="form-input" placeholder="your-cloud-name" />
          </div>
          <div className="form-hint">Konfigurasi Cloudinary di file .env.local</div>
        </div>

        <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            Backup & Restore
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Backup dan restore database artikel, kategori, dan media.</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary">💾 Backup Database</button>
            <button className="btn btn-secondary">📤 Export Artikel (JSON)</button>
            <button className="btn btn-secondary">📥 Import Artikel</button>
          </div>
        </div>
      </div>
    </>
  );
}
