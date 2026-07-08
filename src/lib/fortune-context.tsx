// src/lib/fortune-context.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type FortuneMode = 'fortune' | 'decision';
export type BloodType = 'A' | 'B' | 'O' | 'AB';
export type Gender = 'male' | 'female' | 'na';
// 오늘의 운세 주제 (general=총합. 나머지는 개별 주제)
export type Topic = 'general' | 'love' | 'money' | 'work' | 'health' | 'relationship';

export interface FortuneState {
  mode: FortuneMode;
  topic: Topic;                // ★신규: 선택한 주제 (기본 general)
  zodiacSign: string | null;
  bloodType: BloodType | null;
  gender: Gender | null;
  tarotCards: { card_key: string; orientation: 'upright' | 'reversed' }[];
  question: string;
}

interface FortuneContextValue extends FortuneState {
  setMode: (m: FortuneMode) => void;
  setTopic: (t: Topic) => void;   // ★신규
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
  topic: 'general',
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
    setTopic: (topic) => setState((s) => ({ ...s, topic })),
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
