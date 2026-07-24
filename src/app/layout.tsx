// src/app/layout.tsx
// ルートレイアウト — フォント(next/font)/メタ/manifest/OG/AdSense/共通フッター/JSON-LD
// ── S패치 적용판 ──
//   S-4) SITE_URL을 @/lib/site 단일 출처로 통일 (기존 폴백 oracle-v.example.com 제거)
//   S-5) viewport의 maximumScale: 1 제거 — 사용자의 화면 확대(핀치줌)를 막아
//        접근성 감점 요인이었음 (Lighthouse/PageSpeed에서도 지적되는 항목)
//
// ⚠️ NEXT_PUBLIC_SITE_URL を本番ドメインに設定してください(OG画像・sitemapの絶対URL用)。

import type { Metadata, Viewport } from 'next';
import { Shippori_Mincho, Noto_Sans_JP } from 'next/font/google';
import AdSenseScript from '@/components/AdSenseScript';
import AdmaxAd from '@/components/AdmaxAd';
import SiteFooter from '@/components/SiteFooter';
import InstallPrompt from '@/components/InstallPrompt';
import { Analytics } from '@vercel/analytics/next';
import { SITE_URL } from '@/lib/site';
import './globals.css';
import SoundControl from '@/components/SoundControl';

// 見出し用の明朝 + 本文用のゴシック。CSS変数として全ページで利用可能に。
const shippori = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-serif-jp',
  display: 'swap',
});
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ホシドタロ — 今日の運勢',
    template: '%s | ホシドタロ',
  },
  description: '星座とタロットで占う、今日のあなたの運勢。無料でサクッと占えます。',
  applicationName: 'ホシドタロ',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'ホシドタロ' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'ホシドタロ',
    title: 'ホシドタロ — 今日の運勢',
    description: '星座とタロットで占う、今日のあなたの運勢。',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'ホシドタロ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ホシドタロ — 今日の運勢',
    description: '星座とタロットで占う、今日のあなたの運勢。',
    images: ['/og.png'],
  },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
  verification: {
    google: 'yiwCjx_B6Uy1zsmXhVlDLQrNgm8Tok-wFjFQ1Relov4',
    other: {
      'google-adsense-account': 'ca-pub-3526070606686847',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#14152B',
  width: 'device-width',
  initialScale: 1,
  // S-5: maximumScale: 1 제거 — 핀치줌 차단은 접근성 위반 (WCAG 1.4.4)
};

// 検索エンジン向け構造化データ(サイト情報)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ホシドタロ',
  url: SITE_URL,
  description: '星座とタロットで占う、今日のあなたの運勢。',
  inLanguage: 'ja',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${shippori.variable} ${notoSansJP.variable}`}>
      <body className="flex min-h-screen flex-col bg-[#14152B] text-slate-100 antialiased">
        <SoundControl />
        <div className="flex-1">{children}</div>

        {/*
          모든 페이지 공통 하단 광고.
          여기 한 곳에 두면 사이트 전체 페이지에 자동으로 들어간다.
          (개별 페이지에 일일이 붙일 필요가 없다)

          ※ 예전에는 next/script의 <Script>로 넣었는데, 그 방식은
            ① JSX에 쓴 위치에 렌더링되지 않아 광고가 안 나오고
            ② document.write가 페이지 로드 후 실행되어 문서 전체를 지울 위험이 있었다.
            그래서 iframe으로 감싸 안전하게 실행하는 방식으로 바꿨다.
        */}
        <AdmaxAd className="mx-auto max-w-md px-6 sm:max-w-2xl" />

        <InstallPrompt />
        <SiteFooter />
        <AdSenseScript />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
