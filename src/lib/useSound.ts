// src/lib/useSound.ts
// 효과음 — Web Audio API로 코드 생성. 오디오 파일 0개, 용량 0, 로딩 0.
// on/off는 localStorage에 저장. 브라우저 자동재생 정책상 첫 사용자 제스처에서 컨텍스트 생성.
//
// 소리 종류:
//   tap     — 버튼/선택 (짧고 부드러운 클릭)
//   shuffle — 셔플 시작 (좌르륵 느낌의 노이즈 스윕)
//   reveal  — 결과 공개 (밝은 상승 톤)
//   star    — 레어/축하 (반짝 2음)
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SoundName = 'tap' | 'shuffle' | 'reveal' | 'star';
const LS_KEY = 'hoshidotaro:sfx:v1'; // 'on' | 'off'

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedCtx) {
      const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      sharedCtx = new AC();
    }
    if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {});
    return sharedCtx;
  } catch {
    return null;
  }
}

// 단순 톤 (주파수·길이·파형·볼륨)
function tone(ctx: AudioContext, freq: number, dur: number, type: OscillatorType, gain: number, startAt = 0) {
  const t0 = ctx.currentTime + startAt;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008);        // 부드러운 어택 (클릭 노이즈 방지)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);   // 자연스러운 감쇠
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// 노이즈 스윕 (셔플용)
function noiseSweep(ctx: AudioContext, dur: number, gain: number) {
  const t0 = ctx.currentTime;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, t0);
  filter.frequency.linearRampToValueAtTime(2600, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

function render(ctx: AudioContext, name: SoundName) {
  switch (name) {
    case 'tap':
      tone(ctx, 520, 0.09, 'sine', 0.14);
      break;
    case 'shuffle':
      noiseSweep(ctx, 0.5, 0.06);
      break;
    case 'reveal':
      tone(ctx, 523, 0.14, 'triangle', 0.16);         // C5
      tone(ctx, 784, 0.22, 'triangle', 0.14, 0.1);    // G5
      break;
    case 'star':
      tone(ctx, 1047, 0.12, 'sine', 0.12);            // C6
      tone(ctx, 1568, 0.18, 'sine', 0.1, 0.09);       // G6
      break;
  }
}

export function useSound() {
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(LS_KEY);
      const on = v !== 'off';
      setEnabled(on);
      enabledRef.current = on;
    } catch { /* noop */ }
  }, []);

  const play = useCallback((name: SoundName) => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    if (ctx) render(ctx, name);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      enabledRef.current = next;
      try { window.localStorage.setItem(LS_KEY, next ? 'on' : 'off'); } catch { /* noop */ }
      if (next) { const c = getCtx(); if (c) render(c, 'tap'); } // 켤 때 미리듣기
      return next;
    });
  }, []);

  return { enabled, play, toggle };
}
