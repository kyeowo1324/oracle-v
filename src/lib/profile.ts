// src/lib/profile.ts
// 사용자 프로필 로컬 저장 — 매번 별자리·혈액형·페르소나를 다시 고르는 번거로움 제거.
// 서버 저장 없음(개인정보 미보관 방침 유지). localStorage만 사용 → 비용 $0.
//
// 저장 항목: 별자리, 혈액형, 성별, 선택한 페르소나, (선택)생년월일.
// 생년월일을 넣으면 별자리는 자동 계산해 저장(입력 1회로 별자리 자동 확정).

import type { PersonaKey } from '@/lib/personas';

export type Zodiac =
  | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';
export type Blood = 'A' | 'B' | 'O' | 'AB';
export type Gender = 'male' | 'female' | 'na';

export type UserProfile = {
  zodiac: Zodiac | null;
  blood: Blood | null;
  gender: Gender | null;
  persona: PersonaKey | null;
  /** YYYY-MM-DD (선택) */
  birthday: string | null;
};

const KEY = 'hoshidotaro:profile:v1';

const EMPTY: UserProfile = {
  zodiac: null, blood: null, gender: null, persona: null, birthday: null,
};

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw);
    return { ...EMPTY, ...p };
  } catch {
    return { ...EMPTY };
  }
}

export function saveProfile(patch: Partial<UserProfile>): UserProfile {
  const next = { ...loadProfile(), ...patch };
  // 생년월일이 들어오면 별자리 자동 계산(사용자가 별자리를 명시하지 않았을 때만 덮어씀)
  if (patch.birthday && !patch.zodiac) {
    const z = zodiacFromBirthday(patch.birthday);
    if (z) next.zodiac = z;
  }
  try {
    if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* 저장 실패는 무시(비필수) */ }
  return next;
}

export function clearProfile(): void {
  try { if (typeof window !== 'undefined') localStorage.removeItem(KEY); } catch { /* noop */ }
}

// 생년월일 → 별자리(태양궁). MM-DD 경계 기준.
export function zodiacFromBirthday(ymd: string): Zodiac | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const mon = Number(m[2]), day = Number(m[3]);
  const M = (a: number, b: number) => mon === a && day >= b;
  const D = (a: number, b: number) => mon === a && day <= b;
  if (M(3, 21) || D(4, 19)) return 'aries';
  if (M(4, 20) || D(5, 20)) return 'taurus';
  if (M(5, 21) || D(6, 21)) return 'gemini';
  if (M(6, 22) || D(7, 22)) return 'cancer';
  if (M(7, 23) || D(8, 22)) return 'leo';
  if (M(8, 23) || D(9, 22)) return 'virgo';
  if (M(9, 23) || D(10, 23)) return 'libra';
  if (M(10, 24) || D(11, 22)) return 'scorpio';
  if (M(11, 23) || D(12, 21)) return 'sagittarius';
  if (M(12, 22) || D(1, 19)) return 'capricorn';
  if (M(1, 20) || D(2, 18)) return 'aquarius';
  if (M(2, 19) || D(3, 20)) return 'pisces';
  return null;
}
