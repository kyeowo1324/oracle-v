// src/lib/fortune-context.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type FortuneMode = 'fortune' | 'decision';
export type BloodType = 'A' | 'B' | 'O' | 'AB';
export type Gender = 'male' | 'female' | 'na';   // na = 답하지 않음. 저장하지 않고 세션 계산에만 사용

export interface FortuneState {
  mode: FortuneMode;
  zodiacSign: string | null;   // 직접 선택 (생년월일 계산·저장 없음)
  bloodType: BloodType | null;
  gender: Gender | null;       // AI 종합 문단에만 반영, DB 저장 안 함
  tarotCards: { card_key: string; orientation: 'upright' | 'reversed' }[];
  question: string;
}

interface FortuneContextValue extends FortuneState {
  setMode: (m: FortuneMode) => void;
  setZodiac: (sign: string) => void;
  skipZodiac: () => void;
  setBloodType: (bt: BloodType) => void;
  skipBloodType: () => void;
  setGender: (g: Gender) => void;
  skipGender: () => void;
  setTarotCards: (cards: FortuneState['tarotCards']) => void;
  setQuestion: (q: string) => void;
  reset: () => void;
}

const initialState: FortuneState = {
  mode: 'fortune',
  zodiacSign: null,
  bloodType: null,
  gender: null,
  tarotCards: [],
  question: '',
};

const FortuneContext = createContext<FortuneContextValue | null>(null);

export function FortuneProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FortuneState>(initialState);

  const value: FortuneContextValue = {
    ...state,
    setMode: (mode) => setState((s) => ({ ...s, mode })),
    setZodiac: (zodiacSign) => setState((s) => ({ ...s, zodiacSign })),
    skipZodiac: () => setState((s) => ({ ...s, zodiacSign: null })),
    setBloodType: (bloodType) => setState((s) => ({ ...s, bloodType })),
    skipBloodType: () => setState((s) => ({ ...s, bloodType: null })),
    setGender: (gender) => setState((s) => ({ ...s, gender })),
    skipGender: () => setState((s) => ({ ...s, gender: null })),
    setTarotCards: (tarotCards) => setState((s) => ({ ...s, tarotCards })),
    setQuestion: (question) => setState((s) => ({ ...s, question })),
    reset: () => setState(initialState),
  };

  return <FortuneContext.Provider value={value}>{children}</FortuneContext.Provider>;
}

export function useFortune() {
  const ctx = useContext(FortuneContext);
  if (!ctx) throw new Error('useFortune must be used within FortuneProvider');
  return ctx;
}
