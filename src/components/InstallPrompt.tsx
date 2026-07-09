// src/components/InstallPrompt.tsx
// ホシドタロ — 하단 설치 배너 (모바일 전용, 자동 노출)
//
// - Android: 공용 훅(useInstallApp)이 모듈 레벨에서 미리 잡아둔
//   beforeinstallprompt로 네이티브 설치 팝업을 바로 띄움.
// - iOS: 안내 모달(InstallGuideModal) 표시.
// - 데스크톱: 이 배너는 안 뜸 (홈 화면의 AppInstallCard가 담당).
// - 이미 설치(standalone)면 아무것도 표시 안 함. 닫으면 7일간 재노출 안 함.
'use client';

import { useEffect, useState } from 'react';
import { useInstallApp } from '@/lib/useInstallApp';
import InstallGuideModal from '@/components/InstallGuideModal';

const DISMISS_KEY = 'hoshidotaro:installBannerDismissedAt';
const DISMISS_DAYS = 7;

function wasDismissedRecently(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const days = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24);
  return !Number.isNaN(days) && days < DISMISS_DAYS;
}

export default function InstallPrompt() {
  const { platform, browser, isStandalone, canPrompt, promptInstall } = useInstallApp();
  const [visible, setVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isStandalone || wasDismissedRecently()) return;
    if (platform === 'android' && canPrompt) setVisible(true);
    if (platform === 'ios') {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, [platform, isStandalone, canPrompt]);

  if (!visible) return null;

  const handleInstall = async () => {
    if (platform === 'android' && canPrompt) {
      const accepted = await promptInstall();
      if (accepted) setVisible(false);
      return;
    }
    setShowGuide(true);
  };

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    setShowGuide(false);
  };

  return (
    <>
      <div className="ip-banner fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#3A3C6B] bg-[#1E2050]/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14152B] text-lg">
            ✨
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-[#F6F1E4]">
              ホシドタロをアプリのように
            </p>
            <p className="truncate text-[11px] text-[#8B8DBC]">ホーム画面からすぐ開けます</p>
          </div>
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-full bg-[#C9A227] px-4 py-1.5 text-[12px] font-semibold text-[#14152B] active:scale-95"
          >
            追加する
          </button>
          <button
            onClick={handleDismiss}
            aria-label="閉じる"
            className="shrink-0 px-1 text-[#6B6D9E] hover:text-[#B8B4D9]"
          >
            ✕
          </button>
        </div>
      </div>

      {showGuide && <InstallGuideModal browser={browser} onClose={handleDismiss} />}

      <style jsx>{`
        .ip-banner {
          animation: ipSlideUp 0.35s ease-out;
        }
        @keyframes ipSlideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ip-banner {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
