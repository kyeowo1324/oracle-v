// src/lib/site.ts
// S-4. 사이트 절대 URL의 단일 출처 (Single Source of Truth)
//
// 문제였던 것: layout.tsx / GuideArticle.tsx / MonthlyFortune.tsx 는 폴백이
// 'https://oracle-v.example.com'(존재하지 않는 도메인), sitemap.ts / share / og 는
// 'https://hoshidotaro.vercel.app' 로 파일마다 제각각이었음.
// → 환경변수가 빠지는 순간 JSON-LD·OG가 죽은 도메인을 가리키는 사고 유형.
//
// 이제 모든 파일이 여기서 import:
//   import { SITE_URL } from '@/lib/site';
//
// 커스텀 도메인(C-4) 전환 시에도 Vercel의 NEXT_PUBLIC_SITE_URL만 바꾸면 끝.
// 끝 슬래시는 제거해서 `${SITE_URL}/path` 조합 시 이중 슬래시를 방지.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoshidotaro.vercel.app'
).replace(/\/+$/, '');
