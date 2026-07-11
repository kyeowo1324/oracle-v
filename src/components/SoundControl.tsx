// src/components/SoundControl.tsx
// 우측 상단 고정 사운드 컨트롤: 효과음(SFX) + BGM 토글.
// - BGM은 기본 OFF (자동재생 차단 + 점술 사이트 이탈 방지). 사용자가 켤 때만 재생.
// - BGM도 Web Audio로 생성하는 잔잔한 앰비언트 루프 → 오디오 파일·로딩 0.
// - 상태는 localStorage 저장. layout에 한 번만 넣으면 전 페이지에 뜬다.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSound } from '@/lib/useSound';

const BGM_KEY = 'hoshidotaro:bgm:v1'; // 'on' | 'off'

// 잔잔한 앰비언트 패드: 낮은 화음 2~3음을 느리게 겹쳐 루프. 멜로디 없음(방해되지 않게).
function createBgm(): { start: () => void; stop: () => void } | null {
  if (typeof window === 'undefined') return null;
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let nodes: OscillatorNode[] = [];

  const start = () => {
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2.5); // 아주 낮게 페이드인
      master.connect(ctx.destination);

      // A2, E3, A3 정도의 잔잔한 화음 + 느린 LFO로 볼륨 흔들어 "숨쉬는" 느낌
      const freqs = [110, 164.81, 220];
      freqs.forEach((f, i) => {
        const osc = ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = ctx!.createGain();
        g.gain.value = 0.5 - i * 0.12;
        const lfo = ctx!.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.03; // 매우 느린 흔들림
        const lfoGain = ctx!.createGain();
        lfoGain.gain.value = 0.25;
        lfo.connect(lfoGain).connect(g.gain);
        osc.connect(g).connect(master!);
        osc.start();
        lfo.start();
        nodes.push(osc, lfo);
      });
    } catch { /* 오디오 불가 환경 → 무음 */ }
  };

  const stop = () => {
    try {
      if (ctx && master) {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        const c = ctx;
        setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch { /* */ } }); c.close().catch(() => {}); }, 700);
      }
    } catch { /* noop */ }
    nodes = []; ctx = null; master = null;
  };

  return { start, stop };
}

export default function SoundControl() {
  const sfx = useSound();
  const [open, setOpen] = useState(false);
  const [bgmOn, setBgmOn] = useState(false);
  const bgmRef = useRef<ReturnType<typeof createBgm>>(null);

  useEffect(() => {
    bgmRef.current = createBgm();
    // BGM은 저장값이 'on'이어도 자동재생 정책상 첫 제스처 전까지는 시작하지 않음.
    // 여기선 상태만 복원하고, 실제 start는 사용자가 토글로 켤 때 실행.
    return () => { bgmRef.current?.stop(); };
  }, []);

  const toggleBgm = () => {
    setBgmOn((prev) => {
      const next = !prev;
      try { window.localStorage.setItem(BGM_KEY, next ? 'on' : 'off'); } catch { /* */ }
      if (next) bgmRef.current?.start();
      else bgmRef.current?.stop();
      return next;
    });
  };

  return (
    <div className="fixed right-3 top-3 z-40">
      <div className="flex items-center gap-1">
        {open && (
          <div className="flex items-center gap-1 rounded-full border border-[#3A3C6B] bg-[#14152B]/90 px-2 py-1 backdrop-blur">
            <button
              onClick={() => sfx.toggle()}
              className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${sfx.enabled ? 'bg-[#C9A227] text-[#14152B]' : 'text-[#8B8DBC]'}`}
              aria-pressed={sfx.enabled}
            >
              効果音 {sfx.enabled ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={toggleBgm}
              className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${bgmOn ? 'bg-[#C9A227] text-[#14152B]' : 'text-[#8B8DBC]'}`}
              aria-pressed={bgmOn}
            >
              BGM {bgmOn ? 'ON' : 'OFF'}
            </button>
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="サウンド設定"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3A3C6B] bg-[#14152B]/90 text-[#C9A227] backdrop-blur"
        >
          {sfx.enabled || bgmOn ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  );
}
