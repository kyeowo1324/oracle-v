// src/app/seikaku/layout.tsx
// 이 페이지 본체는 'use client'라 metadata를 가질 수 없다.
// App Router에서는 layout에 메타 정보를 주는 것이 정석이며,
// 이게 없으면 색인되는 모든 페이지가 같은 제목/설명이 되어 검색 평가가 떨어진다.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '星座×血液型 性格診断 — 48パターン',
  description: '12星座と4つの血液型を組み合わせた48パターンで、あなたの性格の傾向を読み解きます。無料・登録不要。',
  openGraph: {
    title: '星座×血液型 性格診断 — 48パターン | ホシドタロ',
    description: '12星座と4つの血液型を組み合わせた48パターンで、あなたの性格の傾向を読み解きます。無料・登録不要。',
  },
  alternates: { canonical: '/seikaku' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
