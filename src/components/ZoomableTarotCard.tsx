// src/components/ZoomableTarotCard.tsx
// 결과 화면의 타로 카드: 탭하면 전체 화면 모달로 확대.
// - 역위치(reversed)는 썸네일·확대 모두 180° 반전 유지
// - 배경/×/ESC 로 닫기, 열려있는 동안 body 스크롤 잠금
'use client';

import { useEffect, useState } from 'react';

interface CardLike {
  name: string;
  image_url?: string;
  orientation: 'upright' | 'reversed';
}

export default function ZoomableTarotCard({
  card,
  widthClass = 'w-36',
}: {
  card: CardLike;
  widthClass?: string;
}) {
  const [imgOk, setImgOk] = useState(true);
  const [open, setOpen] = useState(false);
  const flip = card.orientation === 'reversed' ? 'rotate-180' : '';

  // ESC 닫기 + 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const hasImage = imgOk && card.image_url;

  return (
    <>
      {/* 썸네일 (탭하면 확대) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${card.name}を拡大表示`}
        className={`group relative mx-auto block aspect-[3/5] ${widthClass} cursor-zoom-in overflow-hidden rounded-lg bg-[#2A2D6B] ring-1 ring-[#C9A227]/30 transition-transform active:scale-95`}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.image_url} alt={card.name} onError={() => setImgOk(false)} className={`h-full w-full object-cover ${flip}`} />
        ) : (
          <span className={`flex h-full w-full items-center justify-center p-2 text-center text-xs text-[#C9A227] ${flip}`}>{card.name}</span>
        )}
        {/* 확대 힌트 (호버/기본 은은하게) */}
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-[#F6F1E4]/80 opacity-70 backdrop-blur-sm">
          🔍
        </span>
      </button>

      {/* 확대 모달 */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={card.name}
          onClick={() => setOpen(false)}
          className="ztc-backdrop fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0C1E]/90 px-6 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="閉じる"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#3A3C6B] text-lg text-[#B8B4D9] hover:border-[#C9A227] hover:text-[#F6F1E4]"
          >
            ×
          </button>

          <div className="ztc-card w-full max-w-[300px]" onClick={(e) => e.stopPropagation()}>
            <div className="relative mx-auto aspect-[3/5] max-h-[68vh] overflow-hidden rounded-xl ring-2 ring-[#C9A227]/50 shadow-[0_0_60px_rgba(201,162,39,0.25)]">
              {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image_url} alt={card.name} className={`h-full w-full object-cover ${flip}`} />
              ) : (
                <span className={`flex h-full w-full items-center justify-center bg-[#2A2D6B] p-4 text-center text-base text-[#C9A227] ${flip}`}>
                  {card.name}
                </span>
              )}
            </div>
            <p className="mt-4 text-center text-sm text-[#C9A227]">
              {card.name}（{card.orientation === 'upright' ? '正位置' : '逆位置'}）
            </p>
            <p className="mt-1 text-center text-[11px] text-[#8B8DBC]">タップで閉じる</p>
          </div>

          <style jsx>{`
            .ztc-backdrop {
              animation: ztcFade 0.2s ease-out;
            }
            .ztc-card {
              animation: ztcPop 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2);
            }
            @keyframes ztcFade {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes ztcPop {
              from {
                opacity: 0;
                transform: scale(0.85) translateY(12px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
