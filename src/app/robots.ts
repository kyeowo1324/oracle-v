// src/app/robots.ts
// /robots.txt を自動生成。API ルートはクロール対象外に。

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /result/* 는 sessionStorage의 입력이 있어야 내용이 생기는 화면이라
      // 크롤러가 방문하면 '거의 빈 페이지'로 보인다. 색인되면 품질 평가에 불리하므로 차단.
      disallow: ['/api/', '/result/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
