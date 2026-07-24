// src/app/lucky/layout.tsx
// 이 페이지 본체는 'use client'라 metadata를 가질 수 없다.
// App Router에서는 layout에 메타 정보를 주는 것이 정석이며,
// 이게 없으면 색인되는 모든 페이지가 같은 제목/설명이 되어 검색 평가가 떨어진다.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '今日のラッキーアイテム — 色・数字・方位',
  description: '星座と血液型から、今日のラッキーカラー・ラッキーナンバー・方位・時間帯をご案内。今日の気の流れの理由もあわせてお伝えします。',
  openGraph: {
    title: '今日のラッキーアイテム — 色・数字・方位 | ホシドタロ',
    description: '星座と血液型から、今日のラッキーカラー・ラッキーナンバー・方位・時間帯をご案内。今日の気の流れの理由もあわせてお伝えします。',
  },
  alternates: { canonical: '/lucky' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
