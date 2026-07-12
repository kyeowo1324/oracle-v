// src/components/PersonaPicker.tsx
// 占い師(페르소나) 선택 UI — 각 점 기능 진입부에 얹어 "누가 봐줄지" 고르게 한다.
// 선택값은 profile(localStorage)에 저장되어 다음부터 자동 선택됨.
'use client';

import { PERSONAS, type PersonaKey } from '@/lib/personas';
import { useSound } from '@/lib/useSound';

export default function PersonaPicker({
  value,
  onChange,
  compact = false,
}: {
  value: PersonaKey | null;
  onChange: (k: PersonaKey) => void;
  compact?: boolean;
}) {
  const sound = useSound();
  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'grid grid-cols-2 gap-3'}>
      {PERSONAS.map((p) => {
        const active = value === p.key;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => { sound.play('select'); onChange(p.key); }}
            className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
              active
                ? 'border-[#C9A227] bg-[#C9A227]/10'
                : 'border-[#3A3C6B] bg-[#1A1B3A]/50 hover:border-[#C9A227]/50'
            }`}
            style={active ? { boxShadow: `0 0 0 1px ${p.color}55` } : undefined}
            aria-pressed={active}
          >
            <span className="text-2xl" aria-hidden="true">{p.emoji}</span>
            <span className="min-w-0">
              <span className="block text-sm text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>{p.name}</span>
              {!compact && <span className="block truncate text-[11px] text-[#8B8DBC]">{p.tagline}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
