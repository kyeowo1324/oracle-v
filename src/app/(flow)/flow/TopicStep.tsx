// src/app/(flow)/flow/TopicStep.tsx
// 오늘의 운세 첫 단계: 6주제 중 하나 선택. 선택 즉시 다음 단계로.
'use client';

import { useState } from 'react';
import { useFortune, Topic } from '@/lib/fortune-context';

const TOPICS: { code: Topic; ja: string; icon: string; desc: string }[] = [
  { code: 'general', ja: '総合運', icon: '🌙', desc: '今日全体の運勢' },
  { code: 'love', ja: '恋愛運', icon: '💗', desc: '恋・出会い・関係' },
  { code: 'money', ja: '金運', icon: '💰', desc: 'お金・買い物・収入' },
  { code: 'work', ja: '仕事・学業運', icon: '💼', desc: '仕事・勉強・成果' },
  { code: 'health', ja: '健康運', icon: '🌿', desc: '体調・メンタル' },
  { code: 'relationship', ja: '対人運', icon: '🤝', desc: '友人・家族・職場' },
];

export function TopicStep({ onNext }: { onNext: () => void }) {
  const f = useFortune();
  // 화면 표시용 로컬 선택 상태. f.topic은 context 기본값이 'general'이라
  // 그대로 쓰면 아직 아무것도 안 골랐는데 総合運이 선택된 것처럼 보이는 문제가 있었음.
  const [picked, setPicked] = useState<Topic | null>(null);

  const select = (t: Topic) => {
    setPicked(t);
    f.setTopic(t);
    onNext();
  };

  return (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
        何を占いますか？
      </h2>
      <p className="mt-2 text-center text-sm text-[#B8B4D9]">気になる運勢を選んでください</p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {TOPICS.map((t) => (
          <button
            key={t.code}
            onClick={() => select(t.code)}
            aria-pressed={picked === t.code}
            className={`flex flex-col items-center rounded-xl border py-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A227] ${
              picked === t.code
                ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]'
                : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'
            }`}
          >
            <span className="text-3xl">{t.icon}</span>
            <span className="mt-2 text-base" style={{ fontFamily: "'Shippori Mincho', serif" }}>{t.ja}</span>
            <span className={`mt-1 text-[11px] ${picked === t.code ? 'text-[#14152B]/70' : 'text-[#8B8DBC]'}`}>
              {t.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

