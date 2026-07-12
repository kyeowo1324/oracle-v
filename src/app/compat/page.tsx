// src/app/compat/page.tsx
// 궁합 점 입력 — 관계 선택 → A 정보 → B 정보 → 셔플 → 결과.
// 자체 페이지(flow와 별개): 입력이 2인이라 flow 스텝 구조와 크게 달라 독립 구성.
// 결과는 sessionStorage로 넘겨 /result/compat 에서 표시.
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StarrySky from '@/components/StarrySky';
import ShuffleAnimation from '@/components/ShuffleAnimation';
import { useSound } from '@/lib/useSound';

type Relation = 'love' | 'friend' | 'work';
type Blood = 'A' | 'B' | 'O' | 'AB';
type Gender = 'male' | 'female' | 'na';

const RELATIONS: { key: Relation; ja: string; icon: string; desc: string }[] = [
  { key: 'love', ja: '恋愛', icon: '💗', desc: '好きなあの人との相性' },
  { key: 'friend', ja: '友情', icon: '🤝', desc: '友達・仲間との相性' },
  { key: 'work', ja: '仕事', icon: '💼', desc: '同僚・パートナーとの相性' },
];
const SIGNS = [
  { key: 'aries', ja: '牡羊座' }, { key: 'taurus', ja: '牡牛座' }, { key: 'gemini', ja: '双子座' },
  { key: 'cancer', ja: '蟹座' }, { key: 'leo', ja: '獅子座' }, { key: 'virgo', ja: '乙女座' },
  { key: 'libra', ja: '天秤座' }, { key: 'scorpio', ja: '蠍座' }, { key: 'sagittarius', ja: '射手座' },
  { key: 'capricorn', ja: '山羊座' }, { key: 'aquarius', ja: '水瓶座' }, { key: 'pisces', ja: '魚座' },
];
const BLOODS: Blood[] = ['A', 'B', 'O', 'AB'];
const GENDERS: { key: Gender; ja: string }[] = [
  { key: 'male', ja: '男性' }, { key: 'female', ja: '女性' }, { key: 'na', ja: '未回答' },
];

type Person = { zodiac: string | null; blood: Blood | null; gender: Gender | null };
type Step = 'relation' | 'personA' | 'personB' | 'shuffle';

export default function CompatPage() {
  const router = useRouter();
  const sound = useSound();
  const [step, setStep] = useState<Step>('relation');
  const [relation, setRelation] = useState<Relation>('love');
  const [a, setA] = useState<Person>({ zodiac: null, blood: null, gender: null });
  const [b, setB] = useState<Person>({ zodiac: null, blood: null, gender: null });

  const tap = () => sound.play('tap');

  const runShuffle = async () => {
    setStep('shuffle');
    sound.play('shuffle');
    try {
      const res = await fetch('/api/aisho-tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shuffleCount: 3 + Math.floor(Math.random() * 5), lang: 'ja' }),
      });
      const data = await res.json();
      const cards = data?.cards ?? [];
      if (cards.length < 4) throw new Error('draw failed');
      sessionStorage.setItem('compatInput', JSON.stringify({ relation, personA: a, personB: b, cards }));
      router.push('/result/compat');
    } catch {
      setStep('personB');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-10">
        <button onClick={() => { tap(); router.push('/'); }} className="mb-2 self-start text-xs text-[#8B8DBC] hover:text-[#C9A227]">
          ✦ ホームに戻る
        </button>

        {step === 'shuffle' ? (
          <ShuffleAnimation label="二人の相性を占っています…" />
        ) : (
          <>
            <h1 className="mt-2 text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
              相性占い
            </h1>
            <p className="mt-2 text-center text-xs text-[#B8B4D9]">
              二人の星座・血液型とタロットで相性を占います
            </p>

            {/* STEP 관계 */}
            {step === 'relation' && (
              <div className="mt-8 flex flex-1 flex-col justify-center">
                <p className="mb-3 text-xs font-medium tracking-widest text-[#C9A227]">どんな関係を占う？</p>
                <div className="space-y-3">
                  {RELATIONS.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => { sound.play('select'); setRelation(r.key); setStep('personA'); }}
                      className="flex w-full items-center gap-4 rounded-xl border border-[#3A3C6B] bg-[#1E2050] px-5 py-4 text-left transition-colors hover:border-[#C9A227]"
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <span>
                        <span className="block text-lg" style={{ fontFamily: "'Shippori Mincho', serif" }}>{r.ja}</span>
                        <span className="block text-xs text-[#8B8DBC]">{r.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 인물 입력 (A/B 공통 UI) */}
            {(step === 'personA' || step === 'personB') && (
              <PersonForm
                who={step === 'personA' ? 'あなた' : 'お相手'}
                person={step === 'personA' ? a : b}
                setPerson={step === 'personA' ? setA : setB}
                onTap={tap}
                onBack={() => { tap(); setStep(step === 'personA' ? 'relation' : 'personA'); }}
                onNext={() => {
                  tap();
                  if (step === 'personA') setStep('personB');
                  else runShuffle();
                }}
                nextLabel={step === 'personA' ? '次へ（お相手）' : 'タロットで占う'}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PersonForm({
  who, person, setPerson, onTap, onBack, onNext, nextLabel,
}: {
  who: string;
  person: Person;
  setPerson: (p: Person) => void;
  onTap: () => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  const canProceed = !!person.zodiac; // 별자리만 필수

  return (
    <div className="mt-6 flex flex-1 flex-col">
      <button onClick={onBack} className="mb-3 self-start text-xs text-[#8B8DBC] hover:text-[#F6F1E4]">← 戻る</button>
      <p className="text-center text-lg" style={{ fontFamily: "'Shippori Mincho', serif" }}>
        <span className="text-[#C9A227]">{who}</span>の情報
      </p>

      {/* 별자리 (필수) */}
      <p className="mt-5 mb-2 text-xs font-medium tracking-wide text-[#C9A227]">星座 <span className="text-[#8B8DBC]">（必須）</span></p>
      <div className="grid grid-cols-3 gap-1.5">
        {SIGNS.map((s) => (
          <button
            key={s.key}
            onClick={() => { onTap(); setPerson({ ...person, zodiac: s.key }); }}
            className={`rounded-lg px-1 py-2.5 text-[12px] transition-colors ${
              person.zodiac === s.key ? 'bg-[#C9A227] font-semibold text-[#14152B]' : 'border border-[#3A3C6B] text-[#B8B4D9] hover:border-[#C9A227]'
            }`}
          >
            {s.ja}
          </button>
        ))}
      </div>

      {/* 혈액형 (선택) */}
      <p className="mt-5 mb-2 text-xs font-medium tracking-wide text-[#C9A227]">血液型 <span className="text-[#8B8DBC]">（任意）</span></p>
      <div className="grid grid-cols-4 gap-2">
        {BLOODS.map((bt) => (
          <button
            key={bt}
            onClick={() => { onTap(); setPerson({ ...person, blood: person.blood === bt ? null : bt }); }}
            className={`rounded-lg border py-3 text-base transition-colors ${
              person.blood === bt ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]' : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'
            }`}
          >
            {bt}<span className="text-xs">型</span>
          </button>
        ))}
      </div>

      {/* 성별 (선택) */}
      <p className="mt-5 mb-2 text-xs font-medium tracking-wide text-[#C9A227]">性別 <span className="text-[#8B8DBC]">（任意）</span></p>
      <div className="grid grid-cols-3 gap-2">
        {GENDERS.map((g) => (
          <button
            key={g.key}
            onClick={() => { onTap(); setPerson({ ...person, gender: person.gender === g.key ? null : g.key }); }}
            className={`rounded-lg border py-3 text-sm transition-colors ${
              person.gender === g.key ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]' : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'
            }`}
          >
            {g.ja}
          </button>
        ))}
      </div>

      <p className="mt-5 text-center text-[11px] text-[#5D5F91]">
        入力情報は保存されず、相性の計算にのみ使用されます
      </p>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="mt-4 w-full rounded-xl bg-[#C9A227] py-3.5 text-sm font-semibold text-[#14152B] transition-opacity disabled:opacity-30"
      >
        {nextLabel}
      </button>
    </div>
  );
}
