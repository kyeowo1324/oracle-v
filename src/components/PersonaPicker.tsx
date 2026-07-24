// src/components/PersonaPicker.tsx
// 占い師(페르소나) 선택 UI.
//
// 개선한 점:
//  1) tone 배지(やさしい/するどい/辛口…) — 이름만으로는 성격을 알 수 없어서,
//     한 단어로 못박아 준다. 선택 화면에서 가장 크게 효과가 있는 부분.
//  2) 카드 구조 통일 — 아이콘 / 수식어+이름 / 배지 / 한 줄 설명 순서로 전부 동일.
//     예전에는 이름 길이에 따라 카드가 들쭉날쭉했다.
//  3) 높이 정렬 — items-stretch + h-full 로 한 줄 안의 카드 높이를 맞춘다.
'use client';

import { PERSONAS, fullName, type PersonaKey } from '@/lib/personas';
import { useSound } from '@/lib/useSound';

export default function PersonaPicker({
  value,
  onChange,
  compact = false,
}: {
  value: PersonaKey | null;
  onChange: (k: PersonaKey) => void;
  /** true면 설명문을 감춰 높이를 줄인다(플로우 화면용) */
  compact?: boolean;
}) {
  const sound = useSound();

  return (
    <div
      role="radiogroup"
      aria-label="占ってくれる占い師"
      className="grid grid-cols-2 items-stretch gap-2"
    >
      {PERSONAS.map((p) => {
        const active = value === p.key;
        return (
          <button
            key={p.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => { sound.play('select'); onChange(p.key); }}
            className={`h-full rounded-xl border p-3 text-left transition-colors ${
              active
                ? 'border-[#C9A227] bg-[#C9A227]/12'
                : 'border-[#3A3C6B] bg-[#1A1B3A]/60 hover:border-[#C9A227]/50'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl leading-none" aria-hidden="true">{p.emoji}</span>
              <span className="min-w-0 flex-1">
                {p.epithet && (
                  <span className="block truncate text-[10px] leading-tight text-[#8B8DBC]">
                    {p.epithet}
                  </span>
                )}
                <span
                  className="block truncate text-[15px] leading-tight text-[#F6F1E4]"
                  style={{ fontFamily: "'Shippori Mincho', serif" }}
                >
                  {p.name}
                </span>
              </span>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] leading-none"
                style={
                  active
                    ? { background: p.color, color: '#14152B' }
                    : { background: `${p.color}33`, color: p.color }
                }
              >
                {p.tone}
              </span>
            </span>

            {!compact && (
              <span className="mt-2 block text-[11px] leading-relaxed text-[#9A9AC4]">
                {p.tagline}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** 다른 화면에서 이름을 표시할 때 쓰는 헬퍼(중복 구현 방지) */
export { fullName };
