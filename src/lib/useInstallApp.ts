// src/lib/useInstallApp.ts
// ホシドタロ — 앱 설치 공용 훅 (일본 시장 브라우저 대응판)
//
// 일본 모바일 브라우저 분포(2026, StatCounter): Chrome ≈51%, Safari ≈43%,
// Samsung Internet ≈2%, Edge ≈1%, Firefox ≈1% + 통계에 안 잡히는 LINE 등 인앱 브라우저.
//
// beforeinstallprompt(원탭 설치 팝업)를 실제로 신뢰할 수 있는 건 Android의
// Chrome/Edge 계열뿐이다. Samsung Internet은 명세상 지원하지만 최신 버전(27.x~)에서
// 이벤트가 발화하지 않는 사례가 다수 보고되어, 발화하면 쓰고 안 하면 전용 안내로 폴백한다.
// Firefox·인앱 브라우저는 이벤트 자체가 없다.
//
// 리스너는 모듈 로드 시점에 등록 → 하이드레이션 전에 발생한 이벤트도 잡는다.
'use client';

import { useEffect, useState } from 'react';

export type InstallPlatform = 'android' | 'ios' | 'desktop' | 'other';
export type InstallBrowser =
  | 'chrome-android'   // Chrome/Edge 등 프롬프트 지원 크로미움 (Android)
  | 'samsung'          // Samsung Internet
  | 'firefox-android'  // Firefox (Android)
  | 'android-other'    // 그 외 Android 브라우저
  | 'ios-safari'       // iOS Safari
  | 'ios-other'        // iOS의 Chrome 등 타사 브라우저
  | 'inapp'            // LINE·Instagram·X 등 인앱 브라우저 (설치 불가)
  | 'desktop'
  | 'other';

// ── 모듈 레벨 캡처 (하이드레이션 전에 발생한 이벤트도 잡음) ──
let capturedPrompt: any = null;
const subscribers = new Set<(e: any) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    capturedPrompt = e;
    subscribers.forEach((fn) => fn(e));
  });
  window.addEventListener('appinstalled', () => {
    capturedPrompt = null;
    subscribers.forEach((fn) => fn(null));
  });
}

export function detectPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  // iPadOS 13+는 Mac을 사칭하므로 터치 지원 여부로 함께 판별
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
  if (/Windows|Macintosh|Linux/i.test(ua)) return 'desktop';
  return 'other';
}

export function detectBrowser(): InstallBrowser {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;

  // 인앱 브라우저 우선 판별 (LINE / Instagram / Facebook / X 등) — PWA 설치 자체가 불가
  if (/Line\/|Instagram|FBAN|FBAV|FB_IAB|Twitter|TikTok/i.test(ua)) return 'inapp';

  const platform = detectPlatform();

  if (platform === 'ios') {
    // iOS의 Chrome(CriOS)·Edge(EdgiOS)·Firefox(FxiOS) 등 타사 브라우저
    if (/CriOS|EdgiOS|FxiOS|OPiOS|mercury/i.test(ua)) return 'ios-other';
    return 'ios-safari';
  }

  if (platform === 'android') {
    if (/SamsungBrowser/i.test(ua)) return 'samsung';
    if (/Firefox/i.test(ua)) return 'firefox-android';
    if (/Chrome|EdgA/i.test(ua)) return 'chrome-android';
    return 'android-other';
  }

  if (platform === 'desktop') return 'desktop';
  return 'other';
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

export function useInstallApp() {
  const [platform, setPlatform] = useState<InstallPlatform>('other');
  const [browser, setBrowser] = useState<InstallBrowser>('other');
  const [standalone, setStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setBrowser(detectBrowser());
    setStandalone(isStandalone());
    setDeferredPrompt(capturedPrompt);
    const fn = (e: any) => setDeferredPrompt(e);
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }, []);

  /** 네이티브 설치 팝업 실행 (프롬프트가 잡혀있을 때만). 수락 시 true */
  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    capturedPrompt = null;
    return choice?.outcome === 'accepted';
  };

  return {
    platform,
    browser,
    isStandalone: standalone,
    /** beforeinstallprompt가 실제로 잡혀 원탭 설치가 가능한 상태 */
    canPrompt: !!deferredPrompt,
    promptInstall,
  };
}
