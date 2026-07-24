// src/app/aisho-ranking/layout.tsx
// 이 페이지 본체는 'use client'라 metadata를 가질 수 없다.
// App Router에서는 layout에 메타 정보를 주는 것이 정석이며,
// 이게 없으면 색인되는 모든 페이지가 같은 제목/설명이 되어 검색 평가가 떨어진다.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '星座相性ランキング — 12星座との相性順位',
  description: 'あなたの星座と12星座それぞれの相性を、エレメント（火・地・風・水）の観点からランキング形式でチェックできます。',
  openGraph: {
    title: '星座相性ランキング — 12星座との相性順位 | ホシドタロ',
    description: 'あなたの星座と12星座それぞれの相性を、エレメント（火・地・風・水）の観点からランキング形式でチェックできます。',
  },
  alternates: { canonical: '/aisho-ranking' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
