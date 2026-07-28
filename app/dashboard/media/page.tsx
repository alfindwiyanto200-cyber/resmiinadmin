'use client';

import { useState, useEffect, useRef } from 'react';

interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  createdAt: string;
}

export default function MediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      setMediaList(data.media || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMedia();
  }, []);


  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt', file.name.replace(/\.[^.]+$/, ''));
        await fetch('/api/admin/media', { method: 'POST', body: formData });
      }
      await fetchMedia();
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Media Library</h1>
          <p className="page-subtitle">{mediaList.length} file tersimpan di Cloudinary</p>
        </div>
        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳ Mengupload...' : '⬆️ Upload File'}
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUpload(e.target.files)} />
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#2563eb' : '#d1d5db'}`,
          borderRadius: '12px', padding: '32px', textAlign: 'center',
          background: dragOver ? '#eff6ff' : '#f9fafb',
          cursor: 'pointer', marginBottom: '20px',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
          {dragOver ? 'Lepaskan file di sini' : 'Drag & drop gambar atau klik untuk upload'}
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>PNG, JPG, GIF, WebP — otomatis dikonversi ke WebP</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 280px' : '1fr', gap: '16px' }}>
        {/* Media Grid */}
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', background: '#f3f4f6', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : mediaList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>
              <p>Belum ada media. Upload gambar pertama Anda.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {mediaList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected(selected?.id === item.id ? null : item)}
                  style={{
                    borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                    border: selected?.id === item.id ? '2px solid #2563eb' : '2px solid transparent',
                    background: '#f3f4f6',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.alt || item.fileName}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="card card-body" style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
            <img src={selected.url} alt={selected.alt || ''} style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{selected.fileName}</div>
            {selected.width && <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>{selected.width} × {selected.height} px • {formatSize(selected.size)}</div>}
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
              {new Date(selected.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
            </div>
            <button
              onClick={() => copyUrl(selected.url)}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              📋 Salin URL
            </button>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
              🗑️ Hapus
            </button>
          </div>
        )}
      </div>
    </>
  );
}
