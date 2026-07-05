// src/app/(flow)/flow/ZodiacStep.tsx
// 12별자리 직접 선택(날짜 범위). 이미지 자리 확보(현재는 심볼 폴백, 나중에 /public/zodiac/{code}.png 로 교체).
'use client';

import { useState } from 'react';
import { useFortune } from '@/lib/fortune-context';

const ZODIAC = [
  { code: 'aries', ja: '牡羊座', range: '3/21–4/19', symbol: '♈' },
  { code: 'taurus', ja: '牡牛座', range: '4/20–5/20', symbol: '♉' },
  { code: 'gemini', ja: '双子座', range: '5/21–6/20', symbol: '♊' },
  { code: 'cancer', ja: '蟹座', range: '6/21–7/22', symbol: '♋' },
  { code: 'leo', ja: '獅子座', range: '7/23–8/22', symbol: '♌' },
  { code: 'virgo', ja: '乙女座', range: '8/23–9/22', symbol: '♍' },
  { code: 'libra', ja: '天秤座', range: '9/23–10/22', symbol: '♎' },
  { code: 'scorpio', ja: '蠍座', range: '10/23–11/21', symbol: '♏' },
  { code: 'sagittarius', ja: '射手座', range: '11/22–12/21', symbol: '♐' },
  { code: 'capricorn', ja: '山羊座', range: '12/22–1/19', symbol: '♑' },
  { code: 'aquarius', ja: '水瓶座', range: '1/20–2/18', symbol: '♒' },
  { code: 'pisces', ja: '魚座', range: '2/19–3/20', symbol: '♓' },
];

// 이미지 자리: /public/zodiac/{code}.png 가 있으면 자동 사용, 없으면 심볼 폴백
function ZodiacVisual({ code, symbol, active }: { code: string; symbol: string; active: boolean }) {
  const [imgOk, setImgOk] = useState(true);
  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/zodiac/${code}.png`} alt="" onError={() => setImgOk(false)} className="h-7 w-7 object-contain" />
    );
  }
  return <span className={`text-xl ${active ? 'text-[#14152B]' : 'text-[#C9A227]'}`}>{symbol}</span>;
}

export function ZodiacStep({ onNext, onSkip, onBack }: { onNext: () => void; onSkip: () => void; onBack: () => void }) {
  const f = useFortune();
  const select = (code: string) => { f.setZodiac(code); onNext(); };

  return (
    <div className="flex flex-1 flex-col justify-center">
      <button onClick={onBack} className="mb-4 self-start text-xs text-[#8B8DBC] hover:text-[#F6F1E4]">
        ← 戻る
      </button>
      <h2 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>星座を選ぶ</h2>
      <p className="mt-2 text-center text-sm text-[#B8B4D9]">あなたの星座をタップ</p>

      <div className="mt-8 grid grid-cols-3 gap-2.5">
        {ZODIAC.map((z) => (
          <button
            key={z.code}
            onClick={() => select(z.code)}
            aria-pressed={f.zodiacSign === z.code}
            className={`flex flex-col items-center rounded-xl border py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A227] ${
              f.zodiacSign === z.code
                ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]'
                : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'
            }`}
          >
            <ZodiacVisual code={z.code} symbol={z.symbol} active={f.zodiacSign === z.code} />
            <span className="mt-1 text-sm" style={{ fontFamily: "'Shippori Mincho', serif" }}>{z.ja}</span>
            <span className={`mt-0.5 text-[10px] ${f.zodiacSign === z.code ? 'text-[#14152B]/70' : 'text-[#8B8DBC]'}`}>
              {z.range}
            </span>
          </button>
        ))}
      </div>

      <button onClick={onSkip} className="mx-auto mt-8 block text-xs text-[#8B8DBC] underline underline-offset-4 hover:text-[#F6F1E4]">
        星座をスキップ（タロットだけで占う）
      </button>
    </div>
  );
}
