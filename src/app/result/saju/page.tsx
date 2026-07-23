// src/app/result/saju/page.tsx
// 四柱推命 결과. 계산값은 서버가 확정한 것을 그대로 표시하고, 해석문만 AI 생성분.
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StarrySky from '@/components/StarrySky';
import AdBanner from '@/components/AdBanner';
import ShareButtons from '@/components/ShareButtons';
import FortuneTellerLoader from '@/components/FortuneTellerLoader';
import DailyLimitScreen from '@/components/DailyLimitScreen';

type Res = any;

export default function SajuResultPage() {
  const router = useRouter();
  const [data, setData] = useState<Res | null>(null);
  const [limited, setLimited] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const rawInput = sessionStorage.getItem('sajuInput');
    if (!rawInput) { router.replace('/saju'); return; }
    (async () => {
      try {
        const res = await fetch('/api/saju/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: rawInput,
        });
        if (res.status === 429) { setLimited(true); return; }
        const raw = await res.text();
        const json = raw ? JSON.parse(raw) : null;
        if (!json || json.error) { setFailed(true); return; }
        setData(json);
      } catch (e) {
        console.error('saju fetch failed:', e);
        setFailed(true);
      }
    })();
  }, [router]);

  if (limited) return <DailyLimitScreen />;
  if (failed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#14152B] px-6 text-center text-[#F6F1E4]">
        <p className="text-sm text-[#B8B4D9]">鑑定に失敗しました。もう一度お試しください。</p>
        <Link href="/saju" className="mt-6 rounded-full bg-[#C9A227] px-6 py-2 text-sm text-[#14152B]">戻る</Link>
      </div>
    );
  }
  if (!data) return <FortuneTellerLoader />;

  const m = data.meishiki;
  const cols: [string, string, string | null][] = [
    ['年柱', m.year, '祖先・幼少期'],
    ['月柱', m.month, '仕事・社会性'],
    ['日柱', m.day, 'あなた自身'],
    ['時柱', m.hour, '晩年・未来'],
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-14 pt-10">
        <Link href="/" onClick={() => {}} className="mb-4 self-start text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</Link>

        <p className="text-center text-[11px] tracking-widest text-[#C9A227]">四柱推命 鑑定</p>
        <h1 className="mt-2 text-center text-2xl leading-snug" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          {data.reading?.headline ?? '命式が整いました'}
        </h1>

        {/* 命式 */}
        <div className="mt-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
          <p className="mb-3 text-[11px] tracking-widest text-[#C9A227]">✦ あなたの命式</p>
          <div className="grid grid-cols-4 gap-2">
            {cols.map(([label, gz, meaning]) => (
              <div key={label} className="rounded-lg bg-[#14152B]/60 py-3 text-center">
                <p className="text-[10px] text-[#8B8DBC]">{label}</p>
                <p className="mt-1 text-xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>{gz ?? '—'}</p>
                <p className="mt-1 text-[9px] leading-tight text-[#5D5F91]">{gz ? meaning : '時刻不明'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 일간 */}
        <div className="mt-4 rounded-xl border border-[#C9A227]/40 bg-gradient-to-b from-[#26284F] to-[#1A1B3A] p-4">
          <p className="text-[11px] tracking-widest text-[#C9A227]">✦ あなたの日主（本質）</p>
          <p className="mt-2 text-lg" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {data.dayStem.char}　{data.dayStem.name}・{data.dayStem.symbol}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#E8E4F5]">{data.dayStem.desc}</p>
        </div>

        {/* 오행 */}
        <div className="mt-4 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
          <p className="mb-3 text-[11px] tracking-widest text-[#C9A227]">✦ 五行のバランス</p>
          <div className="space-y-2">
            {(['木', '火', '土', '金', '水'] as const).map((el) => {
              const v = data.elements[el] ?? 0;
              const pct = Math.min(100, (v / 4) * 100);
              return (
                <div key={el} className="flex items-center gap-2">
                  <span className="w-6 text-sm" style={{ fontFamily: "'Shippori Mincho', serif" }}>{el}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#14152B]">
                    <div className="h-full rounded-full bg-[#C9A227]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-[11px] text-[#8B8DBC]">{v}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[12px] text-[#B8B4D9]">
            {data.strength.label}（{data.strength.score}） — {data.strength.desc}
          </p>
        </div>

        {/* 해석 */}
        {data.reading?.personality && (
          <Section title="性格・気質">{data.reading.personality}</Section>
        )}
        {data.reading?.strength && <Section title="強み">{data.reading.strength}</Section>}
        {data.reading?.caution && <Section title="気をつける点">{data.reading.caution}</Section>}

        <div className="mt-6"><AdBanner slot="saju-mid" /></div>

        {/* 십신 */}
        <div className="mt-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
          <p className="mb-3 text-[11px] tracking-widest text-[#C9A227]">✦ 十神（性質のあらわれ方）</p>
          {[data.tenGods.monthStem, data.tenGods.monthBranch, data.tenGods.dayBranch].map((g: any, i: number) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-sm text-[#F5E6A8]">{g.ja} — {g.keyword}</p>
              <p className="text-[12px] leading-relaxed text-[#B8B4D9]">{g.desc}</p>
            </div>
          ))}
        </div>

        {/* 용신 */}
        <div className="mt-4 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
          <p className="mb-2 text-[11px] tracking-widest text-[#C9A227]">✦ あなたを助ける気（用神）</p>
          <p className="text-lg" style={{ fontFamily: "'Shippori Mincho', serif" }}>{data.usefulElement}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[12px] text-[#B8B4D9]">
            <p>ラッキーカラー：{data.luck.color}</p>
            <p>方位：{data.luck.dir}</p>
            <p>相性の良い季節：{data.luck.season}</p>
            <p>取り入れたい味：{data.luck.food}</p>
          </div>
        </div>

        {/* 대운 */}
        <div className="mt-4 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
          <p className="mb-3 text-[11px] tracking-widest text-[#C9A227]">
            ✦ 大運（10年ごとの流れ・{data.daeun.forward ? '順行' : '逆行'}）
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.daeun.list.map((x: any) => {
              const isNow = x.startAge === data.daeun.current.age;
              return (
                <span key={x.startAge}
                  className={`rounded-full px-2.5 py-1 text-[11px] ${isNow ? 'bg-[#C9A227] text-[#14152B]' : 'bg-[#26284F] text-[#B8B4D9]'}`}>
                  {x.startAge}歳 {x.gz}
                </span>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-[#8B8DBC]">金色が現在の大運です</p>
        </div>

        {data.reading?.advice && <Section title="今日からの一歩">{data.reading.advice}</Section>}

        {/* 안내 */}
        <div className="mt-6 rounded-lg bg-[#26284F]/60 p-3 text-[11px] leading-relaxed text-[#8B8DBC]">
          {data.notice.hourUnknown && <p>※ 出生時刻が不明のため、時柱を除いた三柱で鑑定しています。</p>}
          {data.notice.nearTermBoundary && <p>※ 節入り（季節の切り替わり）に近いお生まれです。出生時刻によって月柱が変わる場合があります。</p>}
          <p>※ 鑑定は傾向を読むものであり、決まった運命を示すものではありません。</p>
        </div>

        <div className="mt-6"><ShareButtons text="四柱推命で自分の命式を見てみた" /></div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/saju" className="rounded-full border border-[#3A3C6B] px-4 py-2 text-[13px] text-[#B8B4D9]">もう一度占う</Link>
          <Link href="/compat" className="rounded-full border border-[#3A3C6B] px-4 py-2 text-[13px] text-[#B8B4D9]">相性占いへ →</Link>
        </div>

        <div className="mt-6"><AdBanner slot="saju-bottom" /></div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
      <p className="mb-2 text-[11px] tracking-widest text-[#C9A227]">✦ {title}</p>
      <p className="text-sm leading-relaxed text-[#E8E4F5]">{children}</p>
    </div>
  );
}
