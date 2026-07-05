// src/app/(flow)/flow/page.tsx
// 공통 입력 플로우: 혈액형+성별(한 화면) → 별자리 → 타로 3장
// mode(fortune | decision)에 따라 마지막에 다른 결과 페이지로 이동
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFortune, FortuneMode } from '@/lib/fortune-context';
import { ProfileStep } from './ProfileStep';
import { ZodiacStep } from './ZodiacStep';
import { TarotStep } from './TarotStep';

type Step = 'profile' | 'zodiac' | 'tarot';

function FlowInner() {
  const router = useRouter();
  const params = useSearchParams();
  const f = useFortune();
  const [step, setStep] = useState<Step>('profile');

  useEffect(() => {
    const m = (params.get('mode') as FortuneMode) ?? 'fortune';
    f.setMode(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goResult = () =>
    router.push(f.mode === 'decision' ? '/result/decision' : '/result/fortune');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-10">
        <StepIndicator step={step} />

        {step === 'profile' && (
          <ProfileStep onNext={() => setStep('zodiac')} />
        )}
        {step === 'zodiac' && (
          <ZodiacStep
            onNext={() => setStep('tarot')}
            onSkip={() => { f.skipZodiac(); setStep('tarot'); }}
            onBack={() => setStep('profile')}
          />
        )}
        {step === 'tarot' && (
          <TarotStep onDone={goResult} onBack={() => setStep('zodiac')} />
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ['profile', 'zodiac', 'tarot'];
  const labels: Record<Step, string> = { profile: '血液型・性別', zodiac: '星座', tarot: 'タロット' };
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

export default function FlowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#14152B]" />}>
      <FlowInner />
    </Suspense>
  );
}
