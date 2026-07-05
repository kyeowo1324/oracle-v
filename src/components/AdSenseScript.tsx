// src/components/AdSenseScript.tsx
// 루트 layout.tsx의 <body> 안에 한 번만 넣으세요.
// 클라이언트 ID가 없으면(승인 전) 스크립트를 아예 로드하지 않습니다.

import Script from 'next/script';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function AdSenseScript() {
  if (!ADSENSE_CLIENT) return null;
  return (
    <Script
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}

// ── layout.tsx 사용 예 ──
// import AdSenseScript from '@/components/AdSenseScript';
// ...
// <body>
//   {children}
//   <AdSenseScript />
// </body>
