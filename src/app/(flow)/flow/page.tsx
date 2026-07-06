// src/app/(flow)/flow/page.tsx
// 공통 입력 플로우 — mode에 따라 분기
//   fortune : 血液型+性別(profile) → 星座 → タロット3枚
//   decision: 質問 → タロット1枚(ワンオラクル)
// 입력값은 전부 sessionStorage에 저장(결과 페이지가 Context 없이 읽음 → 크래시 방지)
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFortune, FortuneMode } from '@/lib/fortune-context';
import { ProfileStep } from './ProfileStep';
import { ZodiacStep } from './ZodiacStep';
import { TarotStep } from './TarotStep';
import { QuestionStep } from './QuestionStep';

type Step = 'profile' | 'zodiac' | 'question' | 'tarot';

function FlowInner() {
  const router = useRouter();
  const params = useSearchParams();
  const f = useFortune();

  const initialMode = (params.get('mode') as FortuneMode) ?? 'fortune';
  const [step, setStep] = useState<Step>(initialMode === 'decision' ? 'question' : 'profile');

  useEffect(() => {
    f.setMode(initialMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDecision = f.mode === 'decision';

  // 결과로 넘어가기 직전, 입력값을 sessionStorage에 저장(결과 페이지가 Context 대신 이걸 읽음)
  const goResult = () => {
    const meta = {
      mode: f.mode,
      zodiacSign: f.zodiacSign,
      bloodType: f.bloodType,
      gender: f.gender,
      question: f.question,
    };
    sessionStorage.setItem('fortuneMeta', JSON.stringify(meta));
    router.push(isDecision ? '/result/decision' : '/result/fortune');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-10">
        {/* 홈으로 돌아가기 (마음이 바뀌어 다른 기능으로 갈 때) */}
        <HomeLink />

        <StepIndicator step={step} isDecision={isDecision} />

        {!isDecision && step === 'profile' && (
          <ProfileStep onNext={() => setStep('zodiac')} />
        )}
        {!isDecision && step === 'zodiac' && (
          <ZodiacStep
            onNext={() => setStep('tarot')}
            onSkip={() => { f.skipZodiac(); setStep('tarot'); }}
            onBack={() => setStep('profile')}
          />
        )}
        {isDecision && step === 'question' && (
          <QuestionStep onNext={() => setStep('tarot')} />
        )}
        {step === 'tarot' && (
          <TarotStep
            cardCount={isDecision ? 1 : 3}
            onDone={goResult}
            onBack={() => setStep(isDecision ? 'question' : 'zodiac')}
          />
        )}
      </div>
    </div>
  );
}

function HomeLink() {
  const router = useRouter();
  const f = useFortune();
  return (
    <button
      onClick={() => { f.reset(); router.push('/'); }}
      className="mb-2 self-start text-xs text-[#8B8DBC] transition-colors hover:text-[#C9A227]"
    >
      ✦ ホームに戻る
    </button>
  );
}

function StepIndicator({ step, isDecision }: { step: Step; isDecision: boolean }) {
  const order: Step[] = isDecision ? ['question', 'tarot'] : ['profile', 'zodiac', 'tarot'];
  const labels: Record<Step, string> = {
    profile: '血液型・性別', zodiac: '星座', question: '質問', tarot: 'タロット',
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

export default function FlowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#14152B]" />}>
      <FlowInner />
    </Suspense>
  );
}
