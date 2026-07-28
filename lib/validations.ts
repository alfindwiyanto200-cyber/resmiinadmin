import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional(),
});

export const articleSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED', 'TRASH']).default('DRAFT'),
  featured: z.boolean().default(false),
  // SEO
  seoTitle: z.string().max(60, 'SEO Title maksimal 60 karakter').optional(),
  seoDescription: z.string().max(160, 'SEO Description maksimal 160 karakter').optional(),
  focusKeyword: z.string().optional(),
  canonicalUrl: z.string().url('Canonical URL tidak valid').optional().or(z.literal('')),
  metaRobots: z.string().optional(),
  metaKeywords: z.string().optional(),
  // OG
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  // Twitter
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  // Schema
  schemaMarkup: z.string().optional(),
  // Publish
  publishedAt: z.string().optional(),
  scheduledAt: z.string().optional(),
  // Tags
  tagIds: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug tidak valid'),
  description: z.string().optional(),
});

export const tagSchema = z.object({
  name: z.string().min(1, 'Nama tag wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug tidak valid'),
});

export const userSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER']),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;
export type UserInput = z.infer<typeof userSchema>;
