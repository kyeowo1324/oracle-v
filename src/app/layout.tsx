// src/app/layout.tsx
// ルートレイアウト — 日本語メタ / manifest / OG / AdSense スクリプト枠込み
//
// ⚠️ metadataBase の URL は本番ドメインに差し替えてください(OG画像の絶対URL化に必要)。

import type { Metadata, Viewport } from 'next';
import AdSenseScript from '@/components/AdSenseScript';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oracle-v.example.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Oracle V — 今日の運勢',
    template: '%s | Oracle V',
  },
  description: '星座とタロットで占う、今日のあなたの運勢。無料でサクッと占えます。',
  applicationName: 'Oracle V',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Oracle V',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'Oracle V',
    title: 'Oracle V — 今日の運勢',
    description: '星座とタロットで占う、今日のあなたの運勢。',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Oracle V' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oracle V — 今日の運勢',
    description: '星座とタロットで占う、今日のあなたの運勢。',
    images: ['/og.png'],
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#1E1B4B] text-slate-100 antialiased">
        {children}
        {/* 승인 전엔 아무것도 로드하지 않음 (컴포넌트 내부에서 처리) */}
        <AdSenseScript />
      </body>
    </html>
  );
}
