// src/components/ShareButtons.tsx
// 결과 공유. 일본 실정 반영: LINE(도달) · X(확산) · Threads · 링크복사 + その他(네이티브 공유).
// Instagram/KakaoTalk은 웹 URL 공유가 막혀있어, 모바일 네이티브 공유 시트(navigator.share)로 커버.
'use client';

import { useState } from 'react';

export default function ShareButtons({ text, url }: { text: string; url?: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const enc = encodeURIComponent;

  const openPopup = (link: string) => window.open(link, '_blank', 'noopener,noreferrer,width=600,height=600');

  const onLine = () => openPopup(`https://line.me/R/msg/text/?${enc(text + '\n' + shareUrl)}`);
  const onX = () => openPopup(`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(shareUrl)}`);
  const onThreads = () => openPopup(`https://www.threads.net/intent/post?text=${enc(text + ' ' + shareUrl)}`);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  // 네이티브 공유(모바일): 인스타·카톡 등 설치된 앱 목록이 뜸. 데스크톱은 미지원 시 숨김.
  const canNativeShare = typeof navigator !== 'undefined' && !!(navigator as any).share;
  const onNative = async () => {
    try {
      await (navigator as any).share({ text, url: shareUrl });
    } catch { /* 취소 등 무시 */ }
  };

  const btn = 'flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-[11px] transition-transform hover:-translate-y-0.5';

  return (
    <div>
      <p className="mb-3 text-center text-xs text-[#8B8DBC]">結果をシェア</p>
      <div className="flex flex-wrap items-stretch justify-center gap-2">
        {/* LINE */}
        <button onClick={onLine} className={`${btn} bg-[#06C755] text-white`} aria-label="LINEでシェア">
          <span className="text-lg">💬</span>LINE
        </button>
        {/* X */}
        <button onClick={onX} className={`${btn} bg-black text-white`} aria-label="Xでシェア">
          <span className="text-lg">𝕏</span>X
        </button>
        {/* Threads */}
        <button onClick={onThreads} className={`${btn} bg-[#101010] text-white ring-1 ring-white/20`} aria-label="Threadsでシェア">
          <span className="text-lg">@</span>Threads
        </button>
        {/* 링크복사 */}
        <button onClick={onCopy} className={`${btn} bg-[#26284F] text-[#F6F1E4]`} aria-label="リンクをコピー">
          <span className="text-lg">{copied ? '✓' : '🔗'}</span>{copied ? 'コピー済' : 'リンク'}
        </button>
        {/* その他(네이티브 공유) — 지원 기기에서만 */}
        {canNativeShare && (
          <button onClick={onNative} className={`${btn} bg-[#26284F] text-[#F6F1E4]`} aria-label="その他でシェア">
            <span className="text-lg">⋯</span>その他
          </button>
        )}
      </div>
    </div>
  );
}
