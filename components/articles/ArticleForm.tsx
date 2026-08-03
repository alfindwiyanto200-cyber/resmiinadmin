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

  // Parse existing schemaMarkup
  let initialArticle = true;
  let initialFaq = false;
  let initialBreadcrumb = false;
  let initialOrg = true;
  let initialFaqList: { question: string; answer: string }[] = [];
  let initialSubcat = '';
  let initialUseAuto = true;

  if (initialData.schemaMarkup) {
    try {
      const parsed = JSON.parse(initialData.schemaMarkup);
      const schemas = Array.isArray(parsed) ? parsed : [parsed];
      
      initialArticle = schemas.some((s: any) => s && (s['@type'] === 'BlogPosting' || s['@type'] === 'Article'));
      initialFaq = schemas.some((s: any) => s && s['@type'] === 'FAQPage');
      initialBreadcrumb = schemas.some((s: any) => s && s['@type'] === 'BreadcrumbList');
      initialOrg = schemas.some((s: any) => s && s['@type'] === 'Organization');

      const faqSchema = schemas.find((s: any) => s && s['@type'] === 'FAQPage');
      if (faqSchema && Array.isArray(faqSchema.mainEntity)) {
        initialFaqList = faqSchema.mainEntity.map((item: any) => ({
          question: item.name || '',
          answer: item.acceptedAnswer?.text || ''
        }));
      }

      const bcSchema = schemas.find((s: any) => s && s['@type'] === 'BreadcrumbList');
      if (bcSchema && Array.isArray(bcSchema.itemListElement) && bcSchema.itemListElement.length > 3) {
        initialSubcat = bcSchema.itemListElement[3]?.name || '';
      }

      initialUseAuto = !initialData.schemaMarkup.includes('"@id":') || initialData.schemaMarkup.includes('#organization');
    } catch {
      initialUseAuto = false;
    }
  }

  const [enableArticleSchema, setEnableArticleSchema] = useState(initialArticle);
  const [enableFaqSchema, setEnableFaqSchema] = useState(initialFaq);
  const [enableBreadcrumbSchema, setEnableBreadcrumbSchema] = useState(initialBreadcrumb);
  const [enableOrgSchema, setEnableOrgSchema] = useState(initialOrg);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(initialFaqList);
  const [subcategory, setSubcategory] = useState(initialSubcat);
  const [useAutoSchema, setUseAutoSchema] = useState(initialUseAuto);
  const [manualSchema, setManualSchema] = useState(initialData.schemaMarkup || '');
  const [socialPreviewTab, setSocialPreviewTab] = useState<'fb' | 'in' | 'tw'>('fb');
  const [showAdvancedJsonLd, setShowAdvancedJsonLd] = useState(false);

  const getImageUrl = (url: string) => url && url.startsWith('http') ? url : url ? url : '/logo.png';


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

  // Schema Generators
  const activeCat = categories.find(c => c.id === categoryId);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://resmiin.vercel.app'}/#organization`,
    "name": "Resmiin",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://resmiin.vercel.app",
    "logo": {
      "@type": "ImageObject",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://resmiin.vercel.app'}/logo.png`
    },
    "sameAs": [
      "https://facebook.com/resmiin",
      "https://twitter.com/resmiin",
      "https://instagram.com/resmiin"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62-812-3456-7890",
      "contactType": "customer service"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": process.env.NEXT_PUBLIC_SITE_URL || "https://resmiin.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://resmiin.vercel.app'}/blog`
      },
      activeCat ? {
        "@type": "ListItem",
        "position": 3,
        "name": activeCat.name,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://resmiin.vercel.app'}/blog/category/${activeCat.name.toLowerCase().replace(/\s+/g, '-')}`
      } : null,
      subcategory ? {
        "@type": "ListItem",
        "position": 4,
        "name": subcategory,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://resmiin.vercel.app'}/blog/tag/${subcategory.toLowerCase().replace(/\s+/g, '-')}`
      } : null
    ].filter(Boolean).map((item: any, idx) => ({ ...item, position: idx + 1 }))
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const finalTitle = seoTitle || title || "Judul Artikel";
  const finalDesc = seoDescription || excerpt || "Ringkasan artikel...";
  const finalImage = ogImage || featuredImage || "/logo.png";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": finalTitle,
    "description": finalDesc,
    "image": finalImage.startsWith('http') ? finalImage : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://resmiin.vercel.app'}${finalImage}`,
    "datePublished": initialData.publishedAt || new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": "Tim Hukum Resmiin"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Resmiin",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://resmiin.vercel.app'}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://resmiin.vercel.app'}/blog/${slug}`
    }
  };

  const getGeneratedJsonLd = () => {
    const list = [];
    if (enableArticleSchema) list.push(articleSchema);
    if (enableFaqSchema && faqs.length > 0) list.push(faqSchema);
    if (enableBreadcrumbSchema) list.push(breadcrumbSchema);
    if (enableOrgSchema) list.push(orgSchema);
    
    if (list.length === 0) return '';
    return JSON.stringify(list.length === 1 ? list[0] : list, null, 2);
  };

  const currentJsonLd = useAutoSchema ? getGeneratedJsonLd() : manualSchema;

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
        schemaMarkup: currentJsonLd,
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

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // SEO Score Analyzer
  const analyzeSeo = () => {
    const checksList: { label: string; pass: boolean; score: number; msg: string }[] = [];
    
    // Title
    const titleOk = seoTitle.length >= 30 && seoTitle.length <= 60;
    checksList.push({
      label: 'SEO Title Ideal',
      pass: titleOk,
      score: titleOk ? 15 : 0,
      msg: !seoTitle ? 'SEO Title belum diisi' : seoTitle.length < 30 ? 'SEO Title terlalu pendek (min 30)' : seoTitle.length > 60 ? 'SEO Title terlalu panjang (max 60)' : 'SEO Title ideal (30-60 karakter)'
    });

    // Description
    const descOk = seoDescription.length >= 70 && seoDescription.length <= 160;
    checksList.push({
      label: 'Meta Description Ideal',
      pass: descOk,
      score: descOk ? 15 : 0,
      msg: !seoDescription ? 'SEO Description belum diisi' : seoDescription.length < 70 ? 'SEO Description terlalu pendek (min 70)' : seoDescription.length > 160 ? 'SEO Description terlalu panjang (max 160)' : 'Meta Description ideal (70-160 karakter)'
    });

    // Focus Keyword
    const hasKeyword = focusKeywords.length > 0;
    const keywordInTitle = hasKeyword && focusKeywords.some(kw => seoTitle.toLowerCase().includes(kw.toLowerCase()) || title.toLowerCase().includes(kw.toLowerCase()));
    checksList.push({
      label: 'Focus Keyword Ditemukan',
      pass: hasKeyword && keywordInTitle,
      score: (hasKeyword ? 8 : 0) + (keywordInTitle ? 7 : 0),
      msg: !hasKeyword ? 'Belum ada Focus Keyword' : !keywordInTitle ? 'Keyword belum ditemukan di Judul Artikel' : 'Focus Keyword ditemukan di Judul'
    });

    // Canonical URL
    const hasCanonical = !!canonicalUrl;
    checksList.push({
      label: 'Canonical URL Tersedia',
      pass: hasCanonical,
      score: hasCanonical ? 10 : 0,
      msg: hasCanonical ? 'Canonical URL tersedia' : 'Canonical URL belum diisi (opsional tapi direkomendasikan)'
    });

    // Article Schema
    checksList.push({
      label: 'Article Schema Aktif',
      pass: enableArticleSchema,
      score: enableArticleSchema ? 10 : 0,
      msg: enableArticleSchema ? 'Article Schema aktif' : 'Article Schema dinonaktifkan'
    });

    // FAQ Schema
    const faqOk = enableFaqSchema && faqs.length > 0;
    checksList.push({
      label: 'FAQ Schema Berfungsi',
      pass: faqOk,
      score: faqOk ? 10 : 0,
      msg: !enableFaqSchema ? 'FAQ Schema dinonaktifkan' : faqs.length === 0 ? 'FAQ diaktifkan tapi belum ada pertanyaan' : `${faqs.length} FAQ aktif`
    });

    // Links
    const hasInternalLink = content.includes('href="/"') || content.includes('href="http://localhost') || content.includes('href="https://resmiin.vercel.app') || content.includes('href="https://resmiin.com');
    const hasExternalLink = content.includes('href="http') && !hasInternalLink;
    checksList.push({
      label: 'Internal & External Links',
      pass: hasInternalLink && hasExternalLink,
      score: (hasInternalLink ? 8 : 0) + (hasExternalLink ? 7 : 0),
      msg: !hasInternalLink && !hasExternalLink ? 'Belum ada link internal/external di konten' : !hasInternalLink ? 'Belum ada internal link' : !hasExternalLink ? 'Belum ada external link' : 'Link internal & external lengkap'
    });

    // Image Alt
    const imgTags = content.match(/<img[^>]*>/g) || [];
    const hasImg = imgTags.length > 0;
    const allHaveAlt = hasImg && imgTags.every(tag => tag.includes('alt=') && !tag.includes('alt=""'));
    checksList.push({
      label: 'Alt Text Gambar',
      pass: !hasImg || allHaveAlt,
      score: (!hasImg || allHaveAlt) ? 10 : 0,
      msg: !hasImg ? 'Tidak ada gambar di konten' : allHaveAlt ? 'Semua gambar memiliki Alt Text' : 'Terdapat gambar yang belum memiliki Alt Text'
    });

    // Heading H2
    const h2Count = (content.match(/<h2[^>]*>/g) || []).length;
    const h2Ok = h2Count >= 2;
    checksList.push({
      label: 'Heading H2 Cukup',
      pass: h2Ok,
      score: h2Ok ? 10 : 0,
      msg: h2Count === 0 ? 'Belum ada heading H2 di konten' : h2Count < 2 ? 'Disarankan minimal 2 heading H2' : `Terdapat ${h2Count} heading H2 (Sangat baik)`
    });

    const totalScore = checksList.reduce((sum, c) => sum + c.score, 0);

    return { totalScore, checksList };
  };

  const { totalScore, checksList } = analyzeSeo();

  // Schema Validation
  const schemaValidation = () => {
    const validationsList: { label: string; pass: boolean; warn?: boolean; msg: string }[] = [];
    validationsList.push({
      label: 'Article Schema',
      pass: enableArticleSchema,
      msg: enableArticleSchema ? 'Article Schema Ready' : 'Article Schema dinonaktifkan'
    });
    validationsList.push({
      label: 'Organization Schema',
      pass: enableOrgSchema,
      msg: enableOrgSchema ? 'Organization Ready' : 'Organization Schema dinonaktifkan'
    });
    validationsList.push({
      label: 'Breadcrumb Schema',
      pass: enableBreadcrumbSchema,
      msg: enableBreadcrumbSchema ? 'Breadcrumb Ready' : 'Breadcrumb Schema dinonaktifkan'
    });
    validationsList.push({
      label: 'FAQ Schema',
      pass: enableFaqSchema && faqs.length > 0,
      warn: enableFaqSchema && faqs.length === 0,
      msg: !enableFaqSchema ? 'FAQ Schema dinonaktifkan' : faqs.length === 0 ? 'FAQ diaktifkan tapi data kosong' : 'FAQ Schema Ready'
    });
    return validationsList;
  };

  const validationsList = schemaValidation();


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
                {/* SEO Score Analyzer Card */}
                <div className="card card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="card-title">SEO Score Analyzer</div>
                    <div style={{
                      background: totalScore >= 80 ? '#dcfce7' : totalScore >= 50 ? '#fef9c3' : '#fee2e2',
                      color: totalScore >= 80 ? '#166534' : totalScore >= 50 ? '#854d0e' : '#991b1b',
                      fontWeight: 800,
                      fontSize: '20px',
                      padding: '6px 16px',
                      borderRadius: '30px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                      {totalScore} / 100
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {checksList.map((check) => (
                      <div key={check.label} className={`seo-indicator ${check.pass ? 'good' : 'bad'}`}>
                        <div className="seo-indicator-dot" />
                        <strong style={{ minWidth: '180px' }}>{check.label}:</strong>
                        <span>{check.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Google Search Preview */}
                <div className="card card-body">
                  <div className="card-title" style={{ marginBottom: '12px' }}>Google Search Preview</div>
                  <div className="seo-preview-box">
                    <div className="seo-preview-google">
                      <div className="seo-preview-url">resmiin.com › blog › {slug || 'slug-artikel'}</div>
                      <div className="seo-preview-title">{seoTitle || title || 'Judul Artikel'} – Resmiin</div>
                      <div className="seo-preview-desc">{seoDescription || excerpt || 'Deskripsi artikel akan muncul di sini...'}</div>
                    </div>
                  </div>
                </div>

                {/* Social Media Preview */}
                <div className="card card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div className="card-title">Social Media Preview</div>
                    <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', padding: '2px', borderRadius: '6px' }}>
                      {(['fb', 'in', 'tw'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setSocialPreviewTab(tab)}
                          style={{
                            padding: '4px 8px', fontSize: '11px', fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: socialPreviewTab === tab ? 'white' : 'transparent',
                            borderRadius: '4px',
                            color: socialPreviewTab === tab ? '#1f2937' : '#6b7280',
                            boxShadow: socialPreviewTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {tab === 'fb' ? 'Facebook' : tab === 'in' ? 'LinkedIn' : 'Twitter (X)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#f9fafb',
                    maxWidth: '450px'
                  }}>
                    <div style={{ position: 'relative', width: '100%', height: '200px', background: '#e5e7eb' }}>
                      {finalImage ? (
                        <img src={getImageUrl(finalImage)} alt="Social preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>No Image</div>
                      )}
                    </div>
                    <div style={{ padding: '12px', background: 'white' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {socialPreviewTab === 'fb' ? 'facebook.com' : socialPreviewTab === 'in' ? 'linkedin.com' : 'twitter.com'}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', marginBottom: '4px', lineHeight: 1.3 }}>
                        {ogTitle || seoTitle || title || 'Judul Postingan'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ogDescription || seoDescription || excerpt || 'Deskripsi postingan media sosial Anda...'}
                      </div>
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
                </div>

                {/* Structured Data Generator Panel */}
                <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="card-title">Structured Data (Schema.org)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input type="checkbox" checked={enableArticleSchema} onChange={(e) => setEnableArticleSchema(e.target.checked)} />
                      <span>Article Schema</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input type="checkbox" checked={enableFaqSchema} onChange={(e) => setEnableFaqSchema(e.target.checked)} />
                      <span>FAQ Schema</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input type="checkbox" checked={enableBreadcrumbSchema} onChange={(e) => setEnableBreadcrumbSchema(e.target.checked)} />
                      <span>Breadcrumb Schema</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input type="checkbox" checked={enableOrgSchema} onChange={(e) => setEnableOrgSchema(e.target.checked)} />
                      <span>Organization Schema (Global)</span>
                    </label>
                  </div>
                </div>

                {/* FAQ Builder Panel */}
                {enableFaqSchema && (
                  <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="card-title">FAQ Builder</div>
                      <button type="button" onClick={handleAddFaq} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        ➕ Tambah FAQ
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {faqs.map((faq, idx) => (
                        <div key={idx} style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px',
                          background: '#f9fafb',
                          position: 'relative'
                        }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            style={{
                              position: 'absolute', right: '12px', top: '12px',
                              background: 'none', border: 'none', color: '#ef4444',
                              cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                          <div className="form-group" style={{ marginBottom: '8px' }}>
                            <label className="form-label" style={{ fontSize: '12px' }}>Pertanyaan #{idx + 1}</label>
                            <input
                              className="form-input"
                              value={faq.question}
                              onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                              placeholder="Tulis pertanyaan..."
                              style={{ padding: '8px 12px', fontSize: '13px' }}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '12px' }}>Jawaban #{idx + 1}</label>
                            <textarea
                              className="form-textarea"
                              value={faq.answer}
                              onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                              rows={2}
                              placeholder="Tulis jawaban..."
                              style={{ padding: '8px 12px', fontSize: '13px' }}
                            />
                          </div>
                        </div>
                      ))}
                      {faqs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '16px', color: '#9ca3af', fontSize: '13px', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                          Belum ada FAQ. Klik "+ Tambah FAQ" untuk membuat pertanyaan.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Breadcrumb Builder Panel */}
                {enableBreadcrumbSchema && (
                  <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="card-title">Breadcrumb Builder</div>
                    <div className="form-group">
                      <label className="form-label">Subkategori (Opsional)</label>
                      <input
                        className="form-input"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="Contoh: OSS RBA, Pendirian PT, dll."
                      />
                      <div className="form-hint">Kosongkan jika tidak ada subkategori</div>
                    </div>
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '13px',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}>
                      <strong>Preview:</strong>
                      <span>Home</span>
                      <span>&gt;</span>
                      <span>Blog</span>
                      <span>&gt;</span>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{activeCat ? activeCat.name : 'Pilih Kategori'}</span>
                      {subcategory && (
                        <>
                          <span>&gt;</span>
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>{subcategory}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Schema Validation Panel */}
                <div className="card card-body">
                  <div className="card-title" style={{ marginBottom: '12px' }}>Schema Validation</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {validationsList.map((val) => (
                      <div key={val.label} className={`seo-indicator ${val.pass ? 'good' : val.warn ? 'warn' : 'bad'}`}>
                        <div className="seo-indicator-dot" />
                        <strong style={{ minWidth: '150px' }}>{val.label}:</strong>
                        <span>{val.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced Mode Collapsible JSON-LD */}
                <div className="card card-body">
                  <div
                    onClick={() => setShowAdvancedJsonLd(!showAdvancedJsonLd)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: '#1f2937'
                    }}
                  >
                    <span>⚙️ Advanced JSON-LD Mode</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {showAdvancedJsonLd ? '▼ Sembunyikan' : '▲ Tampilkan'}
                    </span>
                  </div>
                  
                  {showAdvancedJsonLd && (
                    <div style={{ marginTop: '14px', borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <input
                          type="checkbox"
                          id="useAutoSchema"
                          checked={useAutoSchema}
                          onChange={(e) => {
                            setUseAutoSchema(e.target.checked);
                            if (e.target.checked) {
                              setManualSchema(getGeneratedJsonLd());
                            }
                          }}
                        />
                        <label htmlFor="useAutoSchema" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                          Gunakan JSON-LD Hasil Generate Otomatis (Re-generate otomatis)
                        </label>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Schema JSON-LD</label>
                        <textarea
                          className="form-textarea"
                          value={currentJsonLd}
                          onChange={(e) => {
                            if (!useAutoSchema) {
                              setManualSchema(e.target.value);
                            }
                          }}
                          disabled={useAutoSchema}
                          rows={10}
                          placeholder='{"@context":"https://schema.org","@type":"Article",...}'
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            background: useAutoSchema ? '#f3f4f6' : 'white',
                            cursor: useAutoSchema ? 'not-allowed' : 'text'
                          }}
                        />
                        {useAutoSchema && (
                          <div className="form-hint" style={{ color: '#1d4ed8' }}>
                            💡 Nonaktifkan opsi "Gunakan JSON-LD Hasil Generate Otomatis" di atas jika Anda ingin mengedit kode JSON-LD secara manual.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
