// src/app/(flow)/flow/ProfileStep.tsx
// 혈액형 + 성별을 한 화면에서 입력 (각각 스킵 가능). 저장하지 않고 세션 계산에만 사용.
'use client';

import { useFortune, BloodType, Gender } from '@/lib/fortune-context';

const BLOOD: BloodType[] = ['A', 'B', 'O', 'AB'];
const GENDERS: { code: Gender; ja: string; icon: string }[] = [
  { code: 'male', ja: '男性', icon: '♂' },
  { code: 'female', ja: '女性', icon: '♀' },
  { code: 'na', ja: '答えない', icon: '◌' },
];

export function ProfileStep({ onNext }: { onNext: () => void }) {
  const f = useFortune();

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
        あなたについて
      </h2>
      <p className="mt-2 text-center text-sm text-[#B8B4D9]">占いの精度が上がります（任意）</p>

      {/* 혈액형 */}
      <div className="mt-8">
        <p className="mb-3 text-xs font-medium tracking-wide text-[#C9A227]">血液型</p>
        <div className="grid grid-cols-4 gap-2">
          {BLOOD.map((bt) => (
            <button
              key={bt}
              onClick={() => f.setBloodType(f.bloodType === bt ? (null as any) : bt)}
              aria-pressed={f.bloodType === bt}
              className={`rounded-lg border py-4 text-lg font-medium transition-colors ${
                f.bloodType === bt
                  ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]'
                  : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'
              }`}
            >
              {bt}<span className="text-xs">型</span>
            </button>
          ))}
        </div>
      </div>

      {/* 성별 */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-medium tracking-wide text-[#C9A227]">性別</p>
        <div className="grid grid-cols-3 gap-2">
          {GENDERS.map((g) => (
            <button
              key={g.code}
              onClick={() => f.setGender(f.gender === g.code ? (null as any) : g.code)}
              aria-pressed={f.gender === g.code}
              className={`flex flex-col items-center rounded-lg border py-4 transition-colors ${
                f.gender === g.code
                  ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]'
                  : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'
              }`}
            >
              <span className="text-xl">{g.icon}</span>
              <span className="mt-1 text-xs">{g.ja}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 저장 안 함 명시 (APPI 부담 회피 + 신뢰) */}
      <p className="mt-6 text-center text-[11px] text-[#5D5F91]">
        入力情報は保存されず、今日の占いにのみ使用されます
      </p>

      {/* 다음: 아무것도 안 골라도 진행 가능(둘 다 스킵 = 타로 중심) */}
      <button
        onClick={onNext}
        className="mt-6 w-full rounded-lg bg-[#C9A227] py-3 font-medium text-[#14152B]"
      >
        次へ
      </button>
      <button
        onClick={() => { f.skipBloodType(); f.skipGender(); onNext(); }}
        className="mx-auto mt-4 block text-xs text-[#8B8DBC] underline underline-offset-4 hover:text-[#F6F1E4]"
      >
        スキップして進む
      </button>
    </div>
  );
}
