'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), { ssr: false });

interface Category { id: string; name: string; }
interface Tag { id: string; name: string; }

interface ArticleFormProps {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    featuredImage?: string;
    categoryId?: string;
    status?: string;
    featured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    schemaMarkup?: string;
    publishedAt?: string;
    tagIds?: string[];
  };
  categories: Category[];
  tags: Tag[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function ArticleForm({ initialData = {}, categories, tags }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = !!initialData.id;

  const [title, setTitle] = useState(initialData.title || '');
  const [slug, setSlug] = useState(initialData.slug || '');
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '');
  const [content, setContent] = useState(initialData.content || '');
  const [featuredImage, setFeaturedImage] = useState(initialData.featuredImage || '');
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData.tagIds || []);
  const [status, setStatus] = useState(initialData.status || 'DRAFT');
  const [featured, setFeatured] = useState(initialData.featured || false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'social'>('content');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData.seoDescription || '');
  const [focusKeywords, setFocusKeywords] = useState<string[]>(
    initialData.focusKeyword ? initialData.focusKeyword.split(',').map((k) => k.trim()).filter(Boolean) : []
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState(initialData.canonicalUrl || '');
  const [ogTitle, setOgTitle] = useState(initialData.ogTitle || '');
  const [ogDescription, setOgDescription] = useState(initialData.ogDescription || '');
  const [ogImage, setOgImage] = useState(initialData.ogImage || '');
  const [twitterTitle, setTwitterTitle] = useState(initialData.twitterTitle || '');
  const [twitterDescription, setTwitterDescription] = useState(initialData.twitterDescription || '');
  const [twitterImage, setTwitterImage] = useState(initialData.twitterImage || '');
  const [schemaMarkup, setSchemaMarkup] = useState(initialData.schemaMarkup || '');

  // Auto-generate slug from title (only on create)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(slugify(val));
    }
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const val = keywordInput.trim();
      if (val && !focusKeywords.includes(val)) {
        setFocusKeywords([...focusKeywords, val]);
      }
      setKeywordInput('');
    } else if (e.key === 'Backspace' && !keywordInput && focusKeywords.length > 0) {
      setFocusKeywords(focusKeywords.slice(0, -1));
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setFocusKeywords(focusKeywords.filter((_, i) => i !== index));
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',').map((p) => p.trim()).filter(Boolean);
      const newKeywords = [...focusKeywords];
      parts.forEach((p) => {
        if (!newKeywords.includes(p)) {
          newKeywords.push(p);
        }
      });
      setFocusKeywords(newKeywords);
      setKeywordInput('');
    } else {
      setKeywordInput(val);
    }
  };

  const handleKeywordBlur = () => {
    const val = keywordInput.trim();
    if (val && !focusKeywords.includes(val)) {
      setFocusKeywords([...focusKeywords, val]);
    }
    setKeywordInput('');
  };

  const handleSave = async (saveStatus?: string) => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        title, slug, excerpt, content, featuredImage,
        categoryId: categoryId || null, tagIds: selectedTags,
        status: saveStatus || status, featured,
        seoTitle, seoDescription,
        focusKeyword: focusKeywords.join(', '),
        canonicalUrl,
        ogTitle, ogDescription, ogImage,
        twitterTitle, twitterDescription, twitterImage,
        schemaMarkup,
      };

      const url = isEdit ? `/api/admin/articles/${initialData.id}` : '/api/admin/articles';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan artikel');
        return;
      }
      router.push('/dashboard/articles');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSaving(false);
    }
  };

  // SEO Validation
  const seoChecks = [
    { label: 'SEO Title', status: !seoTitle ? 'bad' : seoTitle.length < 30 ? 'warn' : seoTitle.length > 60 ? 'warn' : 'good', msg: !seoTitle ? 'Belum diisi' : seoTitle.length < 30 ? 'Terlalu pendek (min 30)' : seoTitle.length > 60 ? 'Terlalu panjang (max 60)' : `OK (${seoTitle.length} karakter)` },
    { label: 'SEO Description', status: !seoDescription ? 'bad' : seoDescription.length < 70 ? 'warn' : seoDescription.length > 160 ? 'warn' : 'good', msg: !seoDescription ? 'Belum diisi' : seoDescription.length < 70 ? 'Terlalu pendek (min 70)' : seoDescription.length > 160 ? 'Terlalu panjang (max 160)' : `OK (${seoDescription.length} karakter)` },
    { label: 'Focus Keyword', status: focusKeywords.length === 0 ? 'bad' : 'good', msg: focusKeywords.length === 0 ? 'Belum diisi' : `${focusKeywords.length} kata kunci terisi` },
    { label: 'Canonical URL', status: !canonicalUrl ? 'warn' : 'good', msg: !canonicalUrl ? 'Belum diisi (opsional tapi direkomendasikan)' : 'OK' },
    { label: 'Open Graph', status: !ogTitle || !ogDescription ? 'warn' : 'good', msg: !ogTitle || !ogDescription ? 'OG Title/Description belum lengkap' : 'OK' },
    { label: 'Featured Image', status: !featuredImage ? 'bad' : 'good', msg: !featuredImage ? 'Belum ada gambar utama' : 'OK' },
  ] as const;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Artikel' : 'Artikel Baru'}</h1>
          <p className="page-subtitle">{isEdit ? `Mengedit: ${initialData.title}` : 'Buat artikel baru'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={() => handleSave('DRAFT')} className="btn btn-secondary" disabled={saving}>
            {saving ? '...' : 'Simpan Draft'}
          </button>
          <button type="button" onClick={() => handleSave('PUBLISHED')} className="btn btn-primary" disabled={saving}>
            {saving ? '...' : isEdit ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'flex-start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div className="card card-body">
            <div className="form-group">
              <label className="form-label">Judul Artikel <span className="required">*</span></label>
              <input
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Masukkan judul artikel..."
                style={{ fontSize: '18px', fontWeight: 700 }}
              />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">Slug URL</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '13px', whiteSpace: 'nowrap' }}>resmiin.com/blog/</span>
                <input
                  className="form-input"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="slug-artikel"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e5e7eb', marginBottom: '0' }}>
              {(['content', 'seo', 'social'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 20px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: 'none', borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                    color: activeTab === tab ? '#2563eb' : '#6b7280',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'content' ? '📝 Konten' : tab === 'seo' ? '🔍 SEO' : '📱 Social'}
                </button>
              ))}
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card card-body">
                  <div className="form-group">
                    <label className="form-label">Ringkasan (Excerpt)</label>
                    <textarea
                      className="form-textarea"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      placeholder="Ringkasan singkat artikel (tampil di listing blog)..."
                    />
                    <div className="form-hint">{excerpt.length}/300 karakter</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><div className="card-title">Konten Artikel</div></div>
                  <div style={{ padding: '0' }}>
                    <TiptapEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Mulai menulis artikel Anda di sini..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* SEO Checks */}
                <div className="card card-body">
                  <div className="card-title" style={{ marginBottom: '12px' }}>SEO Score</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {seoChecks.map((check) => (
                      <div key={check.label} className={`seo-indicator ${check.status}`}>
                        <div className="seo-indicator-dot" />
                        <strong style={{ minWidth: '120px' }}>{check.label}:</strong>
                        <span>{check.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Google Preview */}
                <div className="card card-body">
                  <div className="card-title" style={{ marginBottom: '12px' }}>Google Preview</div>
                  <div className="seo-preview-box">
                    <div className="seo-preview-google">
                      <div className="seo-preview-url">resmiin.com › blog › {slug || 'slug-artikel'}</div>
                      <div className="seo-preview-title">{seoTitle || title || 'Judul Artikel'} – Resmiin</div>
                      <div className="seo-preview-desc">{seoDescription || excerpt || 'Deskripsi artikel akan muncul di sini...'}</div>
                    </div>
                  </div>
                </div>

                {/* SEO Fields */}
                <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">SEO Title</label>
                    <input className="form-input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Judul untuk mesin pencari..." maxLength={70} />
                    <div className="form-hint">{seoTitle.length}/60 karakter (ideal)</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">SEO Description</label>
                    <textarea className="form-textarea" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} placeholder="Deskripsi untuk mesin pencari..." maxLength={200} />
                    <div className="form-hint">{seoDescription.length}/160 karakter (ideal)</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Focus Keyword</label>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      minHeight: '42px',
                      cursor: 'text'
                    }} onClick={(e) => {
                      const input = e.currentTarget.querySelector('input');
                      if (input) input.focus();
                    }}>
                      {focusKeywords.map((kw, idx) => (
                        <div key={idx} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#eff6ff',
                          color: '#1e40af',
                          border: '1px solid #bfdbfe',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '13px',
                          fontWeight: 500
                        }}>
                          <span>{kw}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveKeyword(idx);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              padding: '0 2px',
                              fontSize: '11px',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={handleKeywordChange}
                        onKeyDown={handleKeywordKeyDown}
                        onBlur={handleKeywordBlur}
                        placeholder={focusKeywords.length === 0 ? "Masukkan kata kunci, pisahkan dengan koma atau Enter..." : ""}
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: '14px',
                          color: '#1f2937',
                          minWidth: '120px',
                          padding: '2px 0'
                        }}
                      />
                    </div>
                    <div className="form-hint">Tekan <strong>koma (,)</strong> atau <strong>Enter</strong> untuk memisahkan kata kunci</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Canonical URL</label>
                    <input className="form-input" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://resmiin.com/blog/..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Schema JSON-LD</label>
                    <textarea className="form-textarea" value={schemaMarkup} onChange={(e) => setSchemaMarkup(e.target.value)} rows={5} placeholder='{"@context":"https://schema.org","@type":"Article",...}' style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#374151', marginBottom: '4px' }}>Open Graph (Facebook)</div>
                  <div className="form-group">
                    <label className="form-label">OG Title</label>
                    <input className="form-input" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder={seoTitle || title} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">OG Description</label>
                    <textarea className="form-textarea" value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} rows={2} placeholder={seoDescription || excerpt} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">OG Image URL</label>
                    <input className="form-input" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder={featuredImage} />
                  </div>
                </div>
                <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#374151', marginBottom: '4px' }}>Twitter Card</div>
                  <div className="form-group">
                    <label className="form-label">Twitter Title</label>
                    <input className="form-input" value={twitterTitle} onChange={(e) => setTwitterTitle(e.target.value)} placeholder={ogTitle || seoTitle || title} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Twitter Description</label>
                    <textarea className="form-textarea" value={twitterDescription} onChange={(e) => setTwitterDescription(e.target.value)} rows={2} placeholder={ogDescription || seoDescription || excerpt} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Twitter Image URL</label>
                    <input className="form-input" value={twitterImage} onChange={(e) => setTwitterImage(e.target.value)} placeholder={ogImage || featuredImage} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status */}
          <div className="card card-body">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Terjadwal</option>
                <option value="ARCHIVED">Arsip</option>
              </select>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <label htmlFor="featured" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                Artikel Unggulan
              </label>
            </div>
          </div>

          {/* Featured Image */}
          <div className="card card-body">
            <div className="form-group">
              <label className="form-label">Gambar Utama</label>
              {featuredImage && (
                <img src={featuredImage} alt="Cover" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
              )}
              <input
                className="form-input"
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://... atau /assets/..."
              />
              <div className="form-hint">Masukkan URL gambar atau upload ke Media Library</div>
            </div>
          </div>

          {/* Category */}
          <div className="card card-body">
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">— Pilih Kategori —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="card card-body">
            <label className="form-label" style={{ marginBottom: '8px' }}>Tag</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.id)}
                  style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    border: `1px solid ${selectedTags.includes(tag.id) ? '#2563eb' : '#e5e7eb'}`,
                    background: selectedTags.includes(tag.id) ? '#dbeafe' : 'white',
                    color: selectedTags.includes(tag.id) ? '#1d4ed8' : '#6b7280',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Belum ada tag. Buat di menu Tag.</span>
              )}
            </div>
          </div>

          {/* Save Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => handleSave('PUBLISHED')} className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? '⏳ Menyimpan...' : '🚀 Publish Sekarang'}
            </button>
            <button onClick={() => handleSave('DRAFT')} className="btn btn-secondary" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              💾 Simpan sebagai Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
