// src/components/AppInstallCard.tsx
// ホシドタロ — 홈 화면용 앱 설치 카드 (플랫폼 표기 없음, Android·iOS 공통)
// 배치: 광고(AdBanner)와 占いガイド 사이.
//
// 한 번의 탭으로 가능한 최단 경로:
// - Android(Chrome 등): 탭 → 브라우저 네이티브 설치 팝업이 바로 뜸 (버튼 하나로 설치 완료)
// - iOS(Safari): Apple이 웹에서 설치를 자동 실행하는 것을 허용하지 않으므로,
//   탭 → 최소 단계(3스텝) 안내 모달. 이것이 iOS에서 가능한 최선.
// - 이미 앱으로 실행 중이면 카드 자체가 숨겨짐.
'use client';

import { useState } from 'react';
import { useInstallApp } from '@/lib/useInstallApp';
import InstallGuideModal from '@/components/InstallGuideModal';

export default function AppInstallCard() {
  const { browser, isStandalone, canPrompt, promptInstall } = useInstallApp();
  const [showGuide, setShowGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  // 이미 앱으로 실행 중이거나 방금 설치 완료 → 카드 숨김
  if (isStandalone || installed) return null;

  const handleClick = async () => {
    // 설치 프롬프트가 가능하면(주로 Android) 즉시 네이티브 팝업 — 추가 단계 없음
    if (canPrompt) {
      const accepted = await promptInstall();
      if (accepted) setInstalled(true);
      return;
    }
    // 그 외(iOS 등)는 최소 단계 안내 모달
    setShowGuide(true);
  };

  return (
    <>
      <section className="mt-8">
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
                ホーム画面に追加すれば、ワンタップですぐ開けます。無料・登録不要。
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <span className="rounded-full bg-[#C9A227] px-5 py-1.5 text-[12px] font-semibold text-[#14152B] transition-transform group-active:scale-95">
              ホーム画面に追加
            </span>
          </div>
        </button>
      </section>

      {showGuide && (
        <InstallGuideModal browser={browser} onClose={() => setShowGuide(false)} />
      )}
    </>
  );
}
