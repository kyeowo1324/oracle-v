// src/app/sitemap.ts
// 検索エンジン・AdSense クローラ向けサイトマップ(App Router 自動生成)
// /sitemap.xml として配信されます。

import type { MetadataRoute } from 'next';
import { GUIDE_ARTICLES } from './guide/page';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oracle-v.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    '',
    '/guide',
    '/legal/privacy',
    '/legal/disclaimer',
    '/legal/contact',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.6,
  }));

  const guidePages = GUIDE_ARTICLES.filter((a) => a.published).map((a) => ({
    url: `${SITE_URL}/guide/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...guidePages];
}
