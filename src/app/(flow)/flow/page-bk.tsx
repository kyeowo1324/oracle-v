// src/app/(flow)/flow/page.tsx
// 공통 입력 플로우: 별자리 → 혈액형 → 성별 → 타로 (4단계)
// mode(fortune | decision)에 따라 마지막에 다른 결과 페이지로 이동
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFortune, FortuneMode, BloodType } from '@/lib/fortune-context';
import { ZodiacStep } from './ZodiacStep';
import { GenderStep } from './GenderStep';
import { TarotStep } from './TarotStep';

type Step = 'zodiac' | 'blood' | 'gender' | 'tarot';

function FlowInner() {
  const router = useRouter();
  const params = useSearchParams();
  const f = useFortune();
  const [step, setStep] = useState<Step>('zodiac');

  useEffect(() => {
    const m = (params.get('mode') as FortuneMode) ?? 'fortune';
    f.setMode(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goResult = () =>
    router.push(f.mode === 'decision' ? '/result/decision' : '/result/fortune');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-10">
        <StepIndicator step={step} />

        {step === 'zodiac' && (
          <ZodiacStep
            onNext={() => setStep('blood')}
            onSkip={() => { f.skipZodiac(); setStep('blood'); }}
          />
        )}

        {step === 'blood' && (
          <BloodStep
            onNext={() => setStep('gender')}
            onSkip={() => { f.skipBloodType(); setStep('gender'); }}
            onBack={() => setStep('zodiac')}
          />
        )}

        {step === 'gender' && (
          <GenderStep
            onNext={() => setStep('tarot')}
            onBack={() => setStep('blood')}
          />
        )}

        {step === 'tarot' && (
          <TarotStep onDone={goResult} onBack={() => setStep('gender')} />
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ['zodiac', 'blood', 'gender', 'tarot'];
  const labels: Record<Step, string> = {
    zodiac: '星座', blood: '血液型', gender: '性別', tarot: 'タロット',
  };
  const idx = order.indexOf(step);
  return (
    <div className="mb-8 flex items-center justify-center gap-1.5">
      {order.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <div className={`flex h-7 items-center rounded-full px-2.5 text-xs transition-colors ${
            i <= idx ? 'bg-[#C9A227] text-[#14152B]' : 'bg-[#26284F] text-[#8B8DBC]'
          }`}>
            {labels[s]}
          </div>
          {i < order.length - 1 && <div className={`h-px w-3 ${i < idx ? 'bg-[#C9A227]' : 'bg-[#3A3C6B]'}`} />}
        </div>
      ))}
    </div>
  );
}

/* 혈액형 스텝 (인라인 유지) */
function BloodStep({ onNext, onSkip, onBack }: { onNext: () => void; onSkip: () => void; onBack: () => void }) {
  const f = useFortune();
  const types: BloodType[] = ['A', 'B', 'O', 'AB'];
  return (
    <div className="flex flex-1 flex-col justify-center">
      <button onClick={onBack} className="mb-4 self-start text-xs text-[#8B8DBC] hover:text-[#F6F1E4]">
        ← 戻る
      </button>
      <h2 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>血液型を選択</h2>
      <p className="mt-2 text-center text-sm text-[#B8B4D9]">占いの精度が上がります</p>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {types.map((bt) => (
          <button
            key={bt}
            onClick={() => { f.setBloodType(bt); onNext(); }}
            className={`rounded-lg border py-6 text-2xl font-medium transition-colors ${
              f.bloodType === bt
                ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]'
                : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'
            }`}
          >
            {bt}<span className="text-sm">型</span>
          </button>
        ))}
      </div>
      <button
        onClick={onSkip}
        className="mx-auto mt-6 block text-xs text-[#8B8DBC] underline underline-offset-4 hover:text-[#F6F1E4]"
      >
        血液型をスキップ
      </button>
    </div>
  );
}

export default function FlowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#14152B]" />}>
      <FlowInner />
    </Suspense>
  );
}
