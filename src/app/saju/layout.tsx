// src/app/saju/layout.tsx
// 이 페이지 본체는 'use client'라 metadata를 가질 수 없다.
// App Router에서는 layout에 메타 정보를 주는 것이 정석이며,
// 이게 없으면 색인되는 모든 페이지가 같은 제목/설명이 되어 검색 평가가 떨어진다.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '四柱推命 — 生年月日から本質を読み解く',
  description: '生年月日から命式（四柱）を割り出し、五行バランス・十神・大運まで無料で鑑定。総合運/恋愛/仕事/金運/健康/人間関係の6つの観点から読み解けます。',
  openGraph: {
    title: '四柱推命 — 生年月日から本質を読み解く | ホシドタロ',
    description: '生年月日から命式（四柱）を割り出し、五行バランス・十神・大運まで無料で鑑定。総合運/恋愛/仕事/金運/健康/人間関係の6つの観点から読み解けます。',
  },
  alternates: { canonical: '/saju' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
