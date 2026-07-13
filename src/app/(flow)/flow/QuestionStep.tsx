// src/app/(flow)/flow/QuestionStep.tsx
// する・しない 전용: 질문 입력(任意). 예시 20개 중 랜덤 3개 표시.
'use client';

import { useState, useEffect } from 'react';
import { useFortune } from '@/lib/fortune-context';
import PersonaPicker from '@/components/PersonaPicker';
import { loadProfile, saveProfile } from '@/lib/profile';
import { DEFAULT_PERSONA, type PersonaKey } from '@/lib/personas';

// 일상·인간관계에서 예/아니오로 자주 묻는 질문 20종
const EXAMPLE_POOL = [
  '告白するべき？',
  '転職しようか',
  '今日は出かける？',
  'あの人に連絡してみる？',
  'この買い物、今する？',
  '髪型を変えてみる？',
  '飲み会に参加する？',
  '思い切って有給を取る？',
  '気になる習い事を始める？',
  'あの誘いを断ってもいい？',
  '先に謝ったほうがいい？',
  '引っ越しを考えてもいい？',
  '今日は早く寝る？',
  'ダイエットを今日から始める？',
  'あの人ともう一度話す？',
  '新しいことに挑戦してみる？',
  '節約を始めるべき？',
  '旅行の予約、今しちゃう？',
  'SNSに投稿してみる？',
  '思っていることを正直に伝える？',
];

// 배열에서 n개 랜덤 추출
function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export function QuestionStep({ onNext }: { onNext: () => void }) {
  const f = useFortune();
  const [examples, setExamples] = useState<string[]>([]);
  const [persona, setPersona] = useState<PersonaKey>(DEFAULT_PERSONA);

  // 진입할 때마다 랜덤 3개 (SSR 하이드레이션 불일치 방지 위해 마운트 후 설정)
  useEffect(() => {
    setExamples(pickRandom(EXAMPLE_POOL, 3));
    const p = loadProfile().persona;
    if (p) setPersona(p);
  }, []);

  const reshuffle = () => setExamples(pickRandom(EXAMPLE_POOL, 3));

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
        何を決めますか？
      </h2>
      <p className="mt-2 text-center text-sm text-[#B8B4D9]">
        「はい / いいえ」で答えられる質問を思い浮かべて（任意）
      </p>

      <div className="mt-8">
        <p className="mb-2 text-center text-xs font-medium tracking-widest text-[#C9A227]">占ってくれる占い師</p>
        <PersonaPicker value={persona} onChange={(k) => { setPersona(k); saveProfile({ persona: k }); }} compact />
      </div>

      <textarea
        value={f.question}
        onChange={(e) => f.setQuestion(e.target.value)}
        placeholder="例：この告白、うまくいく？"
        rows={3}
        className="mt-4 w-full resize-none rounded-lg border border-[#3A3C6B] bg-[#1E2050] p-4 text-sm text-[#F6F1E4] placeholder:text-[#5D5F91] focus:border-[#C9A227] focus:outline-none"
      />

      {/* 랜덤 예시 3개 + 다시 뽑기 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => f.setQuestion(ex)}
            className="rounded-full border border-[#3A3C6B] px-3 py-1 text-xs text-[#B8B4D9] transition-colors hover:border-[#C9A227] hover:text-[#F6F1E4]"
          >
            {ex}
          </button>
        ))}
        <button
          onClick={reshuffle}
          className="rounded-full px-2 py-1 text-xs text-[#8B8DBC] transition-colors hover:text-[#C9A227]"
          aria-label="別の例を見る"
        >
          ↻ 他の例
        </button>
      </div>

      <button
        onClick={onNext}
        className="mt-10 w-full rounded-lg bg-[#C9A227] py-3 font-medium text-[#14152B]"
      >
        カードを引く
      </button>
      <button
        onClick={onNext}
        className="mx-auto mt-4 block text-xs text-[#8B8DBC] underline underline-offset-4 hover:text-[#F6F1E4]"
      >
        質問なしで進む
      </button>
    </div>
  );
}
