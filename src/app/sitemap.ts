// src/app/sitemap.ts
// 検索エンジン・AdSense クローラ向けサイトマップ(App Router 自動生成)
// /sitemap.xml として配信されます。
// ── S패치: SITE_URL을 @/lib/site 단일 출처로 통일 (S-4) ──

import type { MetadataRoute } from 'next';
import { GUIDE_ARTICLES } from './guide/page';
import { MONTHLY_2026 } from '@/data/monthly-2026';
import { filterReleased } from '@/lib/monthlyRelease';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    '',
    '/guide',
    '/fortune-2026',
    '/collection',
    '/faq',
    '/about',
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

  // 아직 공개 시점이 안 된 월은 제외 → sitemap에 404 URL이 올라가는 것 방지
  const monthlyPages = filterReleased(MONTHLY_2026).map((m) => ({
    url: `${SITE_URL}/fortune-2026/${m.month}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...guidePages, ...monthlyPages];
}
