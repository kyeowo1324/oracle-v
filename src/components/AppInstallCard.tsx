// src/components/AppInstallCard.tsx
// ホシドタロ — 홈 화면용 앱 설치 카드
// 배치: 광고(AdBanner)와 占いガイド 링크 사이.
//
// 하단 배너(InstallPrompt)와 달리 이 카드는 "항상" 보인다(설치된 상태 제외).
// - Android + 프롬프트 가능: 클릭 즉시 네이티브 설치 팝업
// - iOS / 데스크톱 / 프롬프트 불가 Android: 안내 모달 표시
'use client';

import { useState } from 'react';
import { useInstallApp } from '@/lib/useInstallApp';
import InstallGuideModal from '@/components/InstallGuideModal';

export default function AppInstallCard() {
  const { platform, isStandalone, canPrompt, promptInstall } = useInstallApp();
  const [showGuide, setShowGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  // 이미 앱으로 실행 중이거나 방금 설치 완료 → 카드 숨김
  if (isStandalone || installed) return null;

  const handleClick = async () => {
    if (platform === 'android' && canPrompt) {
      const accepted = await promptInstall();
      if (accepted) setInstalled(true);
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <section className="mx-auto mt-8 max-w-md px-6">
        <button
          onClick={handleClick}
          className="group relative w-full overflow-hidden rounded-2xl border border-[#3A3C6B] bg-gradient-to-br from-[#26284F] to-[#1A1B3A] px-5 py-5 text-left transition-colors hover:border-[#C9A227]/50"
        >
          {/* 우측 상단 장식 별 */}
          <span aria-hidden className="absolute right-4 top-3 text-[#C9A227]/40">✦</span>
          <span aria-hidden className="absolute right-9 top-6 text-[10px] text-[#C9A227]/25">✦</span>

          <div className="flex items-center gap-4">
            {/* 앱 아이콘 느낌의 미니 프레임 */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#14152B] ring-1 ring-[#C9A227]/30">
              <span className="text-2xl">🔮</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-[#F6F1E4]">
                アプリみたいにサッと占う
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#8B8DBC]">
                ホーム画面に追加すれば、アプリのようにワンタップで開けます。ダウンロード不要・無料。
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] text-[#6B6D9E]">
              {platform === 'ios'
                ? 'iPhone / iPad 対応'
                : platform === 'android'
                  ? 'Android 対応'
                  : 'スマホ・PC 対応'}
            </span>
            <span className="rounded-full bg-[#C9A227] px-4 py-1.5 text-[12px] font-semibold text-[#14152B] transition-transform group-active:scale-95">
              ホーム画面に追加
            </span>
          </div>
        </button>
      </section>

      {showGuide && (
        <InstallGuideModal platform={platform} onClose={() => setShowGuide(false)} />
      )}
    </>
  );
}
