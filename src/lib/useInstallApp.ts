// src/lib/useInstallApp.ts
// ホシドタロ — 앱 설치 공용 훅
//
// 핵심 수정: beforeinstallprompt 리스너를 useEffect가 아니라 "모듈 로드 시점"에
// 등록한다. Chrome은 이 이벤트를 페이지 로드 직후 한 번만 발사하는데,
// React 하이드레이션보다 먼저 발생하면 useEffect 방식은 영영 놓친다.
// 모듈 레벨에서 미리 잡아 전역 변수에 보관해두면 언제 마운트되어도 사용 가능.
'use client';

import { useEffect, useState } from 'react';

export type InstallPlatform = 'android' | 'ios' | 'desktop' | 'other';

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
  // iPadOS 13+는 Mac을 사칭하므로 터치 지원 여부로 함께 판별
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
  if (/Windows|Macintosh|Linux/i.test(ua)) return 'desktop';
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
  const [standalone, setStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setStandalone(isStandalone());
    setDeferredPrompt(capturedPrompt);
    const fn = (e: any) => setDeferredPrompt(e);
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }, []);

  /** Android에서 네이티브 설치 팝업 실행. 성공 시 true 반환 */
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
    isStandalone: standalone,
    /** Android + 브라우저가 설치 프롬프트를 지원하는 상태 */
    canPrompt: !!deferredPrompt,
    promptInstall,
  };
}
