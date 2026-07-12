// src/components/home/ServiceTile.tsx
// 홈 카테고리 그리드의 개별 타일. 아이콘 + 제목 + 한 줄 설명.
// 탭 시 효과음(tap)을 울리고 이동. 카테고리 섹션에서 반복 사용.
'use client';

import Link from 'next/link';
import { useSound } from '@/lib/useSound';

export default function ServiceTile({
  href, icon, title, desc, accent = false,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  accent?: boolean;   // 주력 기능은 금색 강조
}) {
  const sound = useSound();
  return (
    <Link
      href={href}
      onClick={() => sound.play('tap')}
      className={`group flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
        accent
          ? 'border-[#C9A227]/50 bg-gradient-to-b from-[#26284F] to-[#1A1B3A] hover:border-[#C9A227]'
          : 'border-[#3A3C6B] bg-[#1A1B3A]/50 hover:border-[#C9A227]/60'
      }`}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#14152B]/60 text-lg ring-1 ring-[#C9A227]/20">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-medium text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          {title}
        </span>
        <span className="mt-0.5 block font-sans text-[11px] leading-snug text-[#8B8DBC]">
          {desc}
        </span>
      </span>
      <span className="ml-auto self-center font-sans text-[#3A3C6B] transition-colors group-hover:text-[#C9A227]">→</span>
    </Link>
  );
}
