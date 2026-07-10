// src/components/DailyLimitScreen.tsx
// 일일 이용 상한(429 rate_limited) 전용 안내 화면.
// result/fortune·result/decision 페이지에서 429 응답을 받았을 때 표시.
//
// 톤: 에러가 아니라 "오늘 몫을 다 썼다"는 안내. AdGateModal과 같은
// 야간 팔레트를 쓰고, 가이드 읽기로 회유해 체류시간을 유지한다.
'use client';

import Link from 'next/link';

const GUIDE_PICKS: { slug: string; title: string }[] = [
  { slug: 'kaiun-habits', title: '毎日できる開運習慣 — 小さな工夫まとめ' },
  { slug: 'how-to-read-daily-fortune', title: '今日の運勢の見方をもっと詳しく' },
  { slug: 'tarot-basics', title: 'タロット占いの基本 — 正位置・逆位置' },
];

export default function DailyLimitScreen() {
  const pick = GUIDE_PICKS[Math.floor(Math.random() * GUIDE_PICKS.length)];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#14152B] px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs tracking-widest text-[#C9A227]">☾ 本日の占い</p>
        <h1 className="mt-3 text-lg text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          本日の利用上限に達しました
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#B8B4D9]">
          カードも少し休む時間。<br />
          日付が変わると、また新しい運勢を占えます。
        </p>

        {/* 회유 동선: 가이드 1편 추천 (체류시간 유지) */}
        <Link
          href={`/guide/${pick.slug}`}
          className="mt-6 flex items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-3 text-left text-[13px] text-[#D8D5EE] transition-colors hover:border-[#C9A227]"
        >
          <span>📖 {pick.title}</span>
          <span className="ml-2 shrink-0 text-[#C9A227]">→</span>
        </Link>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/guide" className="rounded-lg bg-[#C9A227] px-5 py-2.5 text-sm font-medium text-[#14152B]">
            占いガイドを読む
          </Link>
          <Link href="/" className="rounded-lg border border-[#3A3C6B] px-5 py-2.5 text-sm text-[#B8B4D9] hover:border-[#C9A227]">
            ホームへ
          </Link>
        </div>

        <p className="mt-8 text-[11px] text-[#5D5F91]">
          明日の朝、また新しい一枚でお会いしましょう
        </p>
      </div>
    </div>
  );
}
