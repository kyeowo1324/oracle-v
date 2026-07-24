// src/app/compat/layout.tsx
// 이 페이지 본체는 'use client'라 metadata를 가질 수 없다.
// App Router에서는 layout에 메타 정보를 주는 것이 정석이며,
// 이게 없으면 색인되는 모든 페이지가 같은 제목/설명이 되어 검색 평가가 떨어진다.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '相性占い — 二人の相性を星座・血液型・タロットで',
  description: '二人の星座と血液型、タロット4枚から相性を診断。恋愛・友人・仕事など関係性に合わせた読み解きを無料でお届けします。',
  openGraph: {
    title: '相性占い — 二人の相性を星座・血液型・タロットで | ホシドタロ',
    description: '二人の星座と血液型、タロット4枚から相性を診断。恋愛・友人・仕事など関係性に合わせた読み解きを無料でお届けします。',
  },
  alternates: { canonical: '/compat' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
