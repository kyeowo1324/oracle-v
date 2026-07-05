// src/app/(flow)/flow/GenderStep.tsx
// 성별 선택 (남성/여성/답하지 않음). 저장하지 않고 AI 종합 문단 계산에만 사용.
'use client';

import { useFortune, Gender } from '@/lib/fortune-context';

const OPTIONS: { code: Gender; ja: string; icon: string }[] = [
  { code: 'male', ja: '男性', icon: '♂' },
  { code: 'female', ja: '女性', icon: '♀' },
  { code: 'na', ja: '答えない', icon: '◌' },
];

export function GenderStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const f = useFortune();

  const select = (g: Gender) => {
    f.setGender(g);
    onNext();
  };

  return (
    <div className="flex flex-1 flex-col justify-center">
      <button onClick={onBack} className="mb-4 self-start text-xs text-[#8B8DBC] hover:text-[#F6F1E4]">
        ← 戻る
      </button>

      <h2 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
        性別を選ぶ
      </h2>
      <p className="mt-2 text-center text-sm text-[#B8B4D9]">占いのアドバイスに反映されます</p>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {OPTIONS.map((o) => (
          <button
            key={o.code}
            onClick={() => select(o.code)}
            aria-pressed={f.gender === o.code}
            className={`flex flex-col items-center rounded-xl border py-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A227] ${
              f.gender === o.code
                ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]'
                : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'
            }`}
          >
            <span className="text-2xl">{o.icon}</span>
            <span className="mt-2 text-sm">{o.ja}</span>
          </button>
        ))}
      </div>

      {/* 저장하지 않음을 명시해 신뢰도 확보 + APPI 부담 회피 */}
      <p className="mt-6 text-center text-[11px] text-[#5D5F91]">
        入力情報は保存されず、今日の占いにのみ使用されます
      </p>

      <button
        onClick={() => { f.skipGender(); onNext(); }}
        className="mx-auto mt-4 block text-xs text-[#8B8DBC] underline underline-offset-4 hover:text-[#F6F1E4]"
      >
        性別をスキップ
      </button>
    </div>
  );
}
