// src/app/fortune-2026/[month]/page.tsx
// 2026年 月別運勢の個別ページ(動的ルート)。1ファイルで全月をカバー。
// URL例: /fortune-2026/1 , /fortune-2026/2 ...

import { notFound } from 'next/navigation';
import MonthlyFortune from '@/components/MonthlyFortune';
import { MONTHLY_2026 } from '@/data/monthly-2026';

export function generateStaticParams() {
  return MONTHLY_2026.map((m) => ({ month: String(m.month) }));
}

export function generateMetadata({ params }: { params: { month: string } }) {
  const data = MONTHLY_2026.find((m) => String(m.month) === params.month);
  if (!data) return {};
  return { title: data.title, description: data.description };
}

export default function MonthlyPage({ params }: { params: { month: string } }) {
  const data = MONTHLY_2026.find((m) => String(m.month) === params.month);
  if (!data) notFound();
  return <MonthlyFortune data={data} />;
}
