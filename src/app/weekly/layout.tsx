// src/app/weekly/layout.tsx
// 이 페이지 본체는 'use client'라 metadata를 가질 수 없다.
// App Router에서는 layout에 메타 정보를 주는 것이 정석이며,
// 이게 없으면 색인되는 모든 페이지가 같은 제목/설명이 되어 검색 평가가 떨어진다.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '今週の運勢 — 星座別の週間占い',
  description: '12星座別に、今週の総合運・恋愛運・仕事運をチェック。週のはじめに流れをつかんで、いい一週間にしましょう。',
  openGraph: {
    title: '今週の運勢 — 星座別の週間占い | ホシドタロ',
    description: '12星座別に、今週の総合運・恋愛運・仕事運をチェック。週のはじめに流れをつかんで、いい一週間にしましょう。',
  },
  alternates: { canonical: '/weekly' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
