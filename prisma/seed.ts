import 'dotenv/config';
import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@resmiin.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Resmiin@2025!';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create default categories
  const categories = [
    { name: 'Legalitas Bisnis', slug: 'legalitas-bisnis', description: 'Artikel seputar pendirian badan usaha dan legalitas' },
    { name: 'Perbankan Bisnis', slug: 'perbankan-bisnis', description: 'Panduan perbankan untuk perusahaan' },
    { name: 'HAKI & Brand', slug: 'haki-brand', description: 'Hak Kekayaan Intelektual dan merek dagang' },
    { name: 'Perizinan OSS', slug: 'perizinan-oss', description: 'Panduan perizinan OSS NIB' },
    { name: 'Perpajakan', slug: 'perpajakan', description: 'Artikel pajak untuk badan usaha' },
    { name: 'Edukasi Legal', slug: 'edukasi-legal', description: 'Edukasi hukum dan legal bisnis' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    console.log(`✅ Category: ${cat.name}`);
  }

  // Create default tags
  const tags = [
    { name: 'PT', slug: 'pt' },
    { name: 'CV', slug: 'cv' },
    { name: 'NIB', slug: 'nib' },
    { name: 'OSS', slug: 'oss' },
    { name: 'HAKI', slug: 'haki' },
    { name: 'Pajak', slug: 'pajak' },
    { name: 'Startup', slug: 'startup' },
    { name: 'UMKM', slug: 'umkm' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    console.log(`✅ Tag: ${tag.name}`);
  }

  // Seed fallback articles
  const legalCategory = await prisma.category.findUnique({ where: { slug: 'legalitas-bisnis' } });
  const bankCategory = await prisma.category.findUnique({ where: { slug: 'perbankan-bisnis' } });
  const hakiCategory = await prisma.category.findUnique({ where: { slug: 'haki-brand' } });

  const articles = [
    {
      title: 'Hemat 3+ Hari: Cara Terbaru Mendirikan PT Secara Online Tanpa Ribet',
      slug: 'cara-terbaru-mendirikan-pt-online',
      excerpt: 'Proses pendirian PT kini jauh lebih ringkas berkat sistem terintegrasi. Pelajari syarat terbaru, estimasi biaya, dan dokumen wajib agar bisnis Anda langsung legal.',
      content: '<p>Mendirikan Perseroan Terbatas (PT) dulu diidentikkan dengan proses birokrasi yang memakan waktu berminggu-minggu, penumpukan berkas fisik, dan ketidakpastian status hukum. Namun, berkat digitalisasi layanan di Kementerian Hukum dan HAM serta integrasi Online Single Submission (OSS RBA), proses pendirian PT kini <strong>dapat diselesaikan jauh lebih cepat hanya dalam 3 hingga 5 hari kerja.</strong></p><h2>Keuntungan PT Berbadan Hukum</h2><p>Pemisahan harta kekayaan pribadi dengan badan usaha memberikan perlindungan aset yang maksimal bagi para pendiri dan investor.</p>',
      featuredImage: '/assets/blog-1.png',
      categoryId: legalCategory?.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2025-11-05'),
      seoTitle: 'Cara Mendirikan PT Online 2025 — Resmiin',
      seoDescription: 'Panduan lengkap mendirikan PT secara online 2025. Syarat, biaya, dokumen, dan langkah-langkah mudah pendirian PT.',
      focusKeyword: 'mendirikan PT online',
    },
    {
      title: 'Syarat Buka Rekening Giro BCA & Mandiri untuk PT Baru di Tahun Ini',
      slug: 'syarat-buka-rekening-giro-bca-mandiri-pt',
      excerpt: 'Memiliki rekening atas nama perusahaan sangat krusial untuk profesionalisme. Simak panduan langkah dan berkas legalitas yang wajib disiapkan sebelum ke bank.',
      content: '<p>Rekening giro perusahaan adalah keharusan bagi setiap PT yang ingin beroperasi secara profesional. Bank BCA dan Mandiri menjadi pilihan utama karena jaringan yang luas dan fitur perbankan bisnis yang lengkap.</p>',
      featuredImage: '/assets/blog-2.png',
      categoryId: bankCategory?.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2025-06-10'),
      seoTitle: 'Syarat Rekening Giro PT di BCA & Mandiri 2025',
      seoDescription: 'Dokumen dan syarat membuka rekening giro perusahaan di BCA dan Bank Mandiri untuk PT baru.',
      focusKeyword: 'rekening giro PT BCA Mandiri',
    },
    {
      title: 'Mengapa Mendaftarkan Merek HAKI Harus Dilakukan Sebelum Launching Produk?',
      slug: 'mengapa-mendaftarkan-merek-haki-harus-awal',
      excerpt: 'Banyak pebisnis menyesal karena nama brand diserobot orang lain. Ketahui pentingnya memiliki Bukti Pendaftaran HAKI sejak hari pertama bisnis Anda berdiri.',
      content: '<p>Merek adalah aset tak berwujud paling berharga bagi sebuah bisnis. Mendaftarkan merek HAKI (Hak Kekayaan Intelektual) sedini mungkin adalah keputusan bisnis yang paling cerdas yang bisa Anda buat.</p>',
      featuredImage: '/assets/blog-3.png',
      categoryId: hakiCategory?.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date('2025-06-03'),
      seoTitle: 'Pentingnya Daftar Merek HAKI Sebelum Launching',
      seoDescription: 'Alasan mengapa mendaftarkan merek HAKI harus dilakukan sebelum produk diluncurkan ke pasar.',
      focusKeyword: 'daftar merek HAKI',
    },
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        ...article,
        authorId: admin.id,
      },
    });
    console.log(`✅ Article: ${article.title}`);
  }

  console.log('');
  console.log('🎉 Seed selesai!');
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
  console.log('⚠️  Segera ganti password setelah login pertama!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
