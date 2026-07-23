// src/app/saju/page.tsx
// 四柱推命 입력 화면. 생년월일·시각·성별 + 페르소나 선택.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StarrySky from '@/components/StarrySky';
import PersonaPicker from '@/components/PersonaPicker';
import { loadProfile, saveProfile } from '@/lib/profile';
import { DEFAULT_PERSONA, type PersonaKey } from '@/lib/personas';
import { SAJU_THEMES, type SajuTheme } from '@/lib/saju/text';
import { useSound } from '@/lib/useSound';

export default function SajuPage() {
  const router = useRouter();
  const sound = useSound();
  const nowYear = new Date().getFullYear();

  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState<string>('');
  const [unknownHour, setUnknownHour] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [persona, setPersona] = useState<PersonaKey>(DEFAULT_PERSONA);
  const [theme, setTheme] = useState<SajuTheme>('total');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const pf = loadProfile();
    if (pf.persona) setPersona(pf.persona);
    if (pf.birthday) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(pf.birthday);
      if (m) { setYear(m[1]); setMonth(String(Number(m[2]))); setDay(String(Number(m[3]))); }
    }
    if (pf.gender === 'male' || pf.gender === 'female') setGender(pf.gender);
  }, []);

  const y = Number(year), mo = Number(month), d = Number(day);
  const valid = y >= 1900 && y <= nowYear && mo >= 1 && mo <= 12 && d >= 1 && d <= 31
    && gender !== null && (unknownHour || hour !== '');

  const submit = () => {
    if (!valid || busy) return;
    setBusy(true);
    sound.play('select');
    saveProfile({
      birthday: `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      gender, persona,
    });
    sessionStorage.setItem('sajuInput', JSON.stringify({
      year: y, month: mo, day: d,
      hour: unknownHour ? null : Number(hour),
      minute: 0, gender, persona, theme,
    }));
    router.push('/result/saju');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-10">
        <button onClick={() => router.push('/')} className="mb-4 self-start text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</button>

        <h1 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>四柱推命</h1>
        <p className="mt-2 text-center text-sm text-[#B8B4D9]">生年月日から「命式」を出し、生まれ持った気質を読み解きます</p>

        <div className="mt-6">
          <p className="mb-2 text-center text-xs font-medium tracking-widest text-[#C9A227]">占ってくれる占い師</p>
          <PersonaPicker value={persona} onChange={(k) => { setPersona(k); saveProfile({ persona: k }); }} compact />
        </div>

        {/* 관점(테마) 선택 — 같은 命式을 6가지 관점으로 볼 수 있게 */}
        <p className="mt-8 mb-2 text-xs font-medium tracking-widest text-[#C9A227]">何を占う？</p>
        <div className="grid grid-cols-3 gap-2">
          {SAJU_THEMES.map((t) => {
            const on = theme === t.key;
            return (
              <button key={t.key} type="button"
                onClick={() => { sound.play('select'); setTheme(t.key); }}
                aria-pressed={on}
                className={`rounded-xl border px-2 py-3 text-center transition-colors ${on ? 'border-[#C9A227] bg-[#C9A227]/15' : 'border-[#3A3C6B] bg-[#1E2050] hover:border-[#C9A227]/50'}`}>
                <span className="block text-lg" aria-hidden="true">{t.emoji}</span>
                <span className="mt-1 block text-[12px] text-[#F6F1E4]">{t.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-[#5D5F91]">
          ※ 同じ命式でも観点を変えると読み解きが変わります。あとから何度でも切り替えられます。
        </p>

        {/* 생년월일 */}
        <p className="mt-8 mb-2 text-xs font-medium tracking-widest text-[#C9A227]">生年月日</p>
        <div className="flex items-center gap-2">
          <input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="1995" className="w-24 rounded-lg border border-[#3A3C6B] bg-[#1E2050] px-3 py-3 text-center text-sm focus:border-[#C9A227] focus:outline-none" />
          <span className="text-sm text-[#8B8DBC]">年</span>
          <input inputMode="numeric" value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="7" className="w-16 rounded-lg border border-[#3A3C6B] bg-[#1E2050] px-3 py-3 text-center text-sm focus:border-[#C9A227] focus:outline-none" />
          <span className="text-sm text-[#8B8DBC]">月</span>
          <input inputMode="numeric" value={day} onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="20" className="w-16 rounded-lg border border-[#3A3C6B] bg-[#1E2050] px-3 py-3 text-center text-sm focus:border-[#C9A227] focus:outline-none" />
          <span className="text-sm text-[#8B8DBC]">日</span>
        </div>
        <p className="mt-1.5 text-[11px] text-[#5D5F91]">※ 新暦（グレゴリオ暦）でご入力ください</p>

        {/* 시각 */}
        <p className="mt-6 mb-2 text-xs font-medium tracking-widest text-[#C9A227]">出生時刻</p>
        <div className="flex items-center gap-2">
          <select value={hour} disabled={unknownHour} onChange={(e) => setHour(e.target.value)}
            className="flex-1 rounded-lg border border-[#3A3C6B] bg-[#1E2050] px-3 py-3 text-sm disabled:opacity-40 focus:border-[#C9A227] focus:outline-none">
            <option value="">選択してください</option>
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{String(i).padStart(2, '0')}時台</option>
            ))}
          </select>
        </div>
        <button onClick={() => { setUnknownHour(!unknownHour); if (!unknownHour) setHour(''); }}
          className="mt-2 self-start text-xs text-[#8B8DBC] underline underline-offset-4 hover:text-[#F6F1E4]">
          {unknownHour ? '✓ 時刻がわからない（時柱なしで鑑定）' : '時刻がわからない場合はこちら'}
        </button>

        {/* 성별 */}
        <p className="mt-6 mb-2 text-xs font-medium tracking-widest text-[#C9A227]">性別（大運の進み方に使います）</p>
        <div className="grid grid-cols-2 gap-3">
          {([['male', '男性'], ['female', '女性']] as const).map(([k, label]) => (
            <button key={k} onClick={() => { sound.play('select'); setGender(k); }}
              className={`rounded-xl border py-3 text-sm transition-colors ${gender === k ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]' : 'border-[#3A3C6B] bg-[#1E2050] hover:border-[#C9A227]'}`}>
              {label}
            </button>
          ))}
        </div>

        <button onClick={submit} disabled={!valid || busy}
          className="mt-10 w-full rounded-lg bg-[#C9A227] py-3 font-medium text-[#14152B] disabled:opacity-40">
          {busy ? '命式を出しています…' : '命式を見る'}
        </button>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-[#5D5F91]">
          入力された生年月日はサーバーに保存されません。<br />鑑定はエンターテインメントとしてお楽しみください。
        </p>
      </div>
    </div>
  );
}
