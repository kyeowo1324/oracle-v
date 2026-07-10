// src/components/AdGateModal.tsx
// 오늘 무료 조회를 이미 쓴 상태에서, 다시 점을 보러 들어올 때 뜨는 쿨다운 팝업.
//
// [B-4 정책 대응] 이전 버전은 "広告を見て続ける"(광고 시청 → 언락) 구조였는데,
// 이는 AdSense 정책(보상형 인벤토리 외에 광고 시청의 대가로 보상 제공 금지) 위반
// 소지가 있어 광고 요소를 완전히 제거했다. 이제 이 게이트는 순수한 쿨다운
// (Claude API 비용 통제)이며, 대기 중에는 개운 팁과 가이드 추천을 보여준다.
// 광고 수익화는 승인 후 AdSense Auto ads의 Vignette(공식 전면광고)가 담당한다.
//
// ※ 파일명이 AdGateModal인 것은 기존 연결(flow/page.tsx의 import)을 유지하기
//    위함. 내용물에는 광고가 없다.
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 대기 중 순환 표시되는 개운 원포인트 (5초마다 교체)
const TIPS = [
  '玄関を整えると、良い運気が入りやすくなると言われています',
  '朝いちばんの深呼吸3回は、いちばん簡単な開運習慣です',
  '新月は「始める」、満月は「手放す」に向いた日とされています',
  'ラッキーカラーは身につけるだけでなく、小物に取り入れてもOK',
  '同じ質問の占い直しはNG。最初の結果と1週間付き合ってみて',
  '逆位置は「悪い意味」ではなく「立ち止まるサイン」のことも',
  '感謝をひとつ言葉にすると、その日の運の流れが変わるとも',
];

// 대기 중 추천할 가이드 (실존 slug만 — 랜덤 1개 표시)
const GUIDE_PICKS: { slug: string; title: string }[] = [
  { slug: 'kaiun-habits', title: '毎日できる開運習慣 — 小さな工夫まとめ' },
  { slug: 'how-to-read-daily-fortune', title: '今日の運勢の見方をもっと詳しく' },
  { slug: 'tarot-basics', title: 'タロット占いの基本 — 正位置・逆位置' },
  { slug: 'zodiac-compatibility', title: '12星座の相性 — エレメントで見る傾向' },
  { slug: 'lucky-color-number', title: 'ラッキーカラー・ナンバーの活用法' },
];

export default function AdGateModal({
  onClose,
  seconds = 15,
}: {
  onClose: () => void;
  seconds?: number;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [guidePick] = useState(() => GUIDE_PICKS[Math.floor(Math.random() * GUIDE_PICKS.length)]);

  // 카운트다운
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  // 개운 팁 5초마다 순환
  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  // 팝업이 떠 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const ready = remaining <= 0;
  const progress = ((seconds - remaining) / seconds) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#3A3C6B] bg-[#14152B] p-6 text-[#F6F1E4] shadow-2xl">
        <p className="text-center text-xs tracking-widest text-[#C9A227]">本日の無料分は利用済みです</p>
        <h2 className="mt-2 text-center text-lg" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          ☕ 少しひと息ついてから
        </h2>
        <p className="mt-2 text-center text-xs leading-relaxed text-[#B8B4D9]">
          カードの声を聞くには、心を落ち着ける時間も大切。<br />
          少し待つと、もう一度占えます。
        </p>

        {/* 진행 게이지 */}
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#26284F]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#F5E6A8] transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 대기 중 콘텐츠: 개운 원포인트 (순환) */}
        <div className="mt-5 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
          <p className="text-[10px] tracking-widest text-[#C9A227]">✦ 開運ワンポイント</p>
          <p className="mt-2 min-h-[3em] text-[13px] leading-relaxed text-[#D8D5EE]">
            {TIPS[tipIndex]}
          </p>
        </div>

        {/* 대기 중 콘텐츠: 가이드 추천 (랜덤 1개) */}
        <Link
          href={`/guide/${guidePick.slug}`}
          className="mt-3 flex items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/40 px-4 py-3 text-left text-[12px] text-[#B8B4D9] transition-colors hover:border-[#C9A227] hover:text-[#F6F1E4]"
        >
          <span>📖 待ち時間に読む：{guidePick.title}</span>
          <span className="ml-2 shrink-0 text-[#C9A227]">→</span>
        </Link>

        <button
          type="button"
          onClick={onClose}
          disabled={!ready}
          className="mt-6 w-full rounded-lg bg-[#C9A227] py-3 text-sm font-medium text-[#14152B] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        >
          {ready ? 'もう一度占う' : `あと${remaining}秒でお進みいただけます`}
        </button>

        <Link
          href="/"
          className="mt-3 block text-center text-[11px] text-[#6B6D9E] underline underline-offset-4 hover:text-[#B8B4D9]"
        >
          今日はやめておく（ホームへ）
        </Link>
      </div>
    </div>
  );
}
