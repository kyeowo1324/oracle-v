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

  let chordTimer: ReturnType<typeof setInterval> | null = null;
  let padGains: GainNode[] = [];

  const start = () => {
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3); // 아주 낮게 페이드인
      // 부드러운 로우패스로 전체를 감싸 "밤하늘" 질감
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1200;
      lp.connect(ctx.destination);
      master.connect(lp);

      // 3보이스 패드 — 코드 진행에 맞춰 주파수를 부드럽게 갈아끼운다
      const voices = [0, 1, 2].map((i) => {
        const osc = ctx!.createOscillator();
        osc.type = i === 2 ? 'triangle' : 'sine';
        const g = ctx!.createGain();
        g.gain.value = 0.5 - i * 0.1;
        // 느린 LFO로 숨쉬는 느낌
        const lfo = ctx!.createOscillator();
        lfo.frequency.value = 0.05 + i * 0.02;
        const lfoGain = ctx!.createGain();
        lfoGain.gain.value = 0.2;
        lfo.connect(lfoGain).connect(g.gain);
        osc.connect(g).connect(master!);
        osc.start();
        lfo.start();
        nodes.push(osc, lfo);
        padGains.push(g);
        return osc;
      });

      // 코드 진행 (Am - F - C - G 계열의 저음 보이싱). 8초마다 부드럽게 전환.
      const CHORDS = [
        [110.0, 164.81, 220.0],  // Am
        [87.31, 130.81, 174.61], // F
        [130.81, 196.0, 261.63], // C
        [98.0, 146.83, 196.0],   // G
      ];
      let ci = 0;
      const applyChord = () => {
        const c = CHORDS[ci % CHORDS.length];
        voices.forEach((osc, i) => {
          osc.frequency.setTargetAtTime(c[i], ctx!.currentTime, 1.5); // 1.5초 글라이드
        });
        ci++;
      };
      applyChord();
      chordTimer = setInterval(applyChord, 8000);
    } catch { /* 오디오 불가 환경 → 무음 */ }
  };

  const stop = () => {
    try {
      if (chordTimer) { clearInterval(chordTimer); chordTimer = null; }
      if (ctx && master) {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
        const c = ctx;
        setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch { /* */ } }); c.close().catch(() => {}); }, 900);
      }
    } catch { /* noop */ }
    nodes = []; padGains = []; ctx = null; master = null;
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
