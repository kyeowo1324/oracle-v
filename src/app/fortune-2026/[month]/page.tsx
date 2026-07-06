// src/app/fortune-2026/[month]/page.tsx
// ★ Next.js 15/16: params가 Promise → await 필요. (동기 접근이 404의 원인이었음)

import { notFound } from 'next/navigation';
import MonthlyFortune from '@/components/MonthlyFortune';
import { MONTHLY_2026 } from '@/data/monthly-2026';

export function generateStaticParams() {
  return MONTHLY_2026.map((m) => ({ month: String(m.month) }));
}

export async function generateMetadata({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const data = MONTHLY_2026.find((m) => String(m.month) === month);
  if (!data) return {};
  return { title: data.title, description: data.description };
}

export default async function MonthlyPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const data = MONTHLY_2026.find((m) => String(m.month) === month);
  if (!data) notFound();
  return <MonthlyFortune data={data} />;
}
