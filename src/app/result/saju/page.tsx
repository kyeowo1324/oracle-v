// src/app/result/saju/page.tsx
// 四柱推命 결과. 계산값은 서버 확정치를 그대로 표시하고, 해석문만 AI 생성분.
// 재방문 설계: ① 매일 바뀌는 日運  ② 관점(테마) 6종 전환
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StarrySky from '@/components/StarrySky';
import AdBanner from '@/components/AdBanner';
import ShareButtons from '@/components/ShareButtons';
import FortuneTellerLoader from '@/components/FortuneTellerLoader';
import DailyLimitScreen from '@/components/DailyLimitScreen';
import { SAJU_THEMES, type SajuTheme } from '@/lib/saju/text';
import { useSound } from '@/lib/useSound';
import ResultGuideLinks from '@/components/ResultGuideLinks';

type Res = any;
const ELEMENTS = ['木', '火', '土', '金', '水'] as const;

export default function SajuResultPage() {
  const router = useRouter();
  const sound = useSound();
  const [data, setData] = useState<Res | null>(null);
  const [limited, setLimited] = useState(false);
  const [failed, setFailed] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  /** isSwitch=true면 이미 결과가 화면에 있는 상태 → 실패해도 기존 결과를 지운다 */
  const load = useCallback(async (rawInput: string, isSwitch = false) => {
    try {
      const res = await fetch('/api/saju/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rawInput,
      });
      if (res.status === 429) {
        // 관점 전환 중이라면 지금 보고 있는 결과를 없애지 않는다.
        if (isSwitch) setNotice('本日の鑑定回数の上限に達しました。すでに読んだ観点はそのままご覧いただけます。');
        else setLimited(true);
        return;
      }
      const raw = await res.text();
      const json = raw ? JSON.parse(raw) : null;
      if (!json || json.error) {
        if (isSwitch) setNotice('うまく読み解けませんでした。少し時間をおいてお試しください。');
        else setFailed(true);
        return;
      }
      setData(json);
    } catch (e) {
      console.error('saju fetch failed:', e);
      if (isSwitch) setNotice('通信に失敗しました。少し時間をおいてお試しください。');
      else setFailed(true);
    } finally {
      setSwitching(false);
    }
  }, []);

  useEffect(() => {
    const rawInput = sessionStorage.getItem('sajuInput');
    if (!rawInput) { router.replace('/saju'); return; }
    load(rawInput);
  }, [router, load]);

  /** 관점 전환 — 명식은 그대로, 해석만 다시 */
  const switchTheme = (t: SajuTheme) => {
    const raw = sessionStorage.getItem('sajuInput');
    if (!raw || switching) return;
    sound.play('select');
    const next = { ...JSON.parse(raw), theme: t };
    sessionStorage.setItem('sajuInput', JSON.stringify(next));
    setNotice(null);
    setSwitching(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    load(JSON.stringify(next), true);
  };

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
  const cols: [string, string | null, string][] = [
    ['年柱', m.year, '幼少期'],
    ['月柱', m.month, '仕事・社会'],
    ['日柱', m.day, 'あなた自身'],
    ['時柱', m.hour, '晩年・未来'],
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-14 pt-10">
        <Link href="/" className="mb-4 self-start text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</Link>

        {/* ───── 히어로: 일간 상징 ───── */}
        <div className="relative overflow-hidden rounded-2xl border border-[#C9A227]/40 bg-gradient-to-b from-[#2A2D6B] via-[#26284F] to-[#1A1B3A] px-5 pb-6 pt-7 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(circle at 50% 20%, rgba(201,162,39,.35) 0%, transparent 60%)' }} />
          <p className="relative text-[10px] tracking-[0.3em] text-[#C9A227]">
            {data.theme?.emoji} {data.theme?.label ?? '総合運'}
          </p>

          <div className="relative mx-auto mt-4 flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-[#C9A227]/30" />
            <span className="absolute inset-2 rounded-full border border-[#C9A227]/15" />
            <StemVisual src={data.dayStem.image} emoji={data.dayStem.emoji} char={data.dayStem.char} />
          </div>

          <p className="relative mt-4 text-[13px] text-[#F5E6A8]" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {data.dayStem.name}・{data.dayStem.symbol}
          </p>
          <h1 className="relative mt-2 text-xl leading-snug" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {data.reading?.headline ?? '命式が整いました'}
          </h1>
        </div>

        {/* ───── 오늘의 日運 (매일 바뀜) ───── */}
        {data.dayLuck && (
          <div className="mt-4 rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-widest text-[#C9A227]">✦ 今日の日運</p>
              <p className="text-[11px] text-[#8B8DBC]">{data.date}　{data.dayLuck.gz}</p>
            </div>
            <p className="mt-2 text-base" style={{ fontFamily: "'Shippori Mincho', serif" }}>
              {data.dayLuck.mood}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm tracking-wider text-[#C9A227]">
                {'★'.repeat(data.dayLuck.score)}
                <span className="text-[#3A3C6B]">{'★'.repeat(5 - data.dayLuck.score)}</span>
              </span>
              <span className="text-[11px] text-[#8B8DBC]">{data.dayLuck.godJa}</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#B8B4D9]">{data.dayLuck.advice}</p>
            <p className="mt-2 text-[10px] text-[#5D5F91]">※ 日運は毎日変わります。明日もぜひ。</p>
          </div>
        )}

        {/* ───── 命式 ───── */}
        <div className="mt-4 rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4">
          <p className="mb-3 text-[11px] tracking-widest text-[#C9A227]">✦ あなたの命式</p>
          <div className="grid grid-cols-4 gap-2">
            {cols.map(([label, gz, meaning]) => (
              <div key={label}
                className={`rounded-xl py-3 text-center ${label === '日柱' ? 'bg-[#C9A227]/15 ring-1 ring-[#C9A227]/50' : 'bg-[#14152B]/70'}`}>
                <p className="text-[10px] text-[#8B8DBC]">{label}</p>
                {gz ? (
                  <p className="mt-1.5 leading-none" style={{ fontFamily: "'Shippori Mincho', serif" }}>
                    <span className="block text-lg text-[#F5E6A8]">{gz[0]}</span>
                    <span className="mt-1 block text-lg">{gz[1]}</span>
                  </p>
                ) : (
                  <p className="mt-1.5 text-lg text-[#3A3C6B]">—</p>
                )}
                <p className="mt-1.5 text-[9px] leading-tight text-[#5D5F91]">{gz ? meaning : '時刻不明'}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#5D5F91]">上段が天干（表に出る性質）、下段が地支（内に持つ性質）です</p>
        </div>

        {/* ───── 오행 레이더 ───── */}
        <div className="mt-4 rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4">
          <p className="mb-1 text-[11px] tracking-widest text-[#C9A227]">✦ 五行のバランス</p>
          <ElementRadar elements={data.elements} />
          <p className="mt-1 text-center text-[12px] text-[#F5E6A8]">
            {data.strength.label}（{data.strength.score}）
          </p>
          <p className="mt-1 text-center text-[12px] leading-relaxed text-[#8B8DBC]">{data.strength.desc}</p>
        </div>

        {/* ───── 해석 ───── */}
        {data.reading?.personality && (
          <Section title={`${data.theme?.label ?? '総合運'}の読み解き`}>{data.reading.personality}</Section>
        )}
        {data.reading?.strength && <Section title="強み">{data.reading.strength}</Section>}
        {data.reading?.caution && <Section title="気をつける点">{data.reading.caution}</Section>}

        <div className="mt-6"><AdBanner slot="saju-mid" /></div>

        {/* ───── 관점 전환 (재방문 핵심) ───── */}
        <div className="mt-6 rounded-2xl border border-[#C9A227]/40 bg-gradient-to-b from-[#26284F] to-[#1A1B3A] p-4">
          <p className="text-[11px] tracking-widest text-[#C9A227]">✦ 別の観点でも読む</p>
          <p className="mt-1 text-[12px] text-[#B8B4D9]">同じ命式でも、聞くことを変えると見えるものが変わります。</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {SAJU_THEMES.map((t) => {
              const on = data.theme?.key === t.key;
              return (
                <button key={t.key} onClick={() => switchTheme(t.key)} disabled={on || switching}
                  className={`rounded-xl border px-2 py-2.5 text-center transition-colors ${on ? 'border-[#C9A227] bg-[#C9A227]/20 opacity-60' : 'border-[#3A3C6B] bg-[#14152B]/60 hover:border-[#C9A227]/60'}`}>
                  <span className="block text-base" aria-hidden="true">{t.emoji}</span>
                  <span className="mt-0.5 block text-[11px]">{t.label}</span>
                </button>
              );
            })}
          </div>
          {switching && <p className="mt-2 text-center text-[11px] text-[#C9A227]">読み解いています…</p>}
          {notice && !switching && (
            <p className="mt-3 rounded-lg bg-[#14152B]/70 px-3 py-2 text-center text-[11px] leading-relaxed text-[#F5E6A8]">
              {notice}
            </p>
          )}
        </div>

        {/* ───── 십신 ───── */}
        <div className="mt-4 rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4">
          <p className="mb-3 text-[11px] tracking-widest text-[#C9A227]">✦ 十神（性質のあらわれ方）</p>
          {[data.tenGods.monthStem, data.tenGods.monthBranch, data.tenGods.dayBranch].map((g: any, i: number) => (
            <div key={i} className="mb-3 border-l-2 border-[#C9A227]/40 pl-3 last:mb-0">
              <p className="text-sm text-[#F5E6A8]">{g.ja} — {g.keyword}</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-[#B8B4D9]">{g.desc}</p>
            </div>
          ))}
        </div>

        {/* ───── 용신 ───── */}
        <div className="mt-4 rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4">
          <p className="mb-2 text-[11px] tracking-widest text-[#C9A227]">✦ あなたを助ける気（用神）</p>
          <p className="text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>{data.usefulElement}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-[#B8B4D9]">
            <p>🎨 色：{data.luck.color}</p>
            <p>🧭 方位：{data.luck.dir}</p>
            <p>🍃 季節：{data.luck.season}</p>
            <p>🍽 味：{data.luck.food}</p>
          </div>
        </div>

        {/* ───── 대운 ───── */}
        <div className="mt-4 rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4">
          <p className="mb-3 text-[11px] tracking-widest text-[#C9A227]">
            ✦ 大運（10年ごとの流れ・{data.daeun.forward ? '順行' : '逆行'}）
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.daeun.list.map((x: any) => {
              const isNow = x.startAge === data.daeun.current.age;
              return (
                <span key={x.startAge}
                  className={`rounded-full px-2.5 py-1 text-[11px] ${isNow ? 'bg-[#C9A227] font-medium text-[#14152B]' : 'bg-[#26284F] text-[#B8B4D9]'}`}>
                  {x.startAge}歳 {x.gz}
                </span>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-[#8B8DBC]">金色が現在の大運です</p>
        </div>

        {data.reading?.advice && <Section title="今日からの一歩">{data.reading.advice}</Section>}

        <div className="mt-6 rounded-xl bg-[#26284F]/60 p-3 text-[11px] leading-relaxed text-[#8B8DBC]">
          {data.notice.hourUnknown && <p>※ 出生時刻が不明のため、時柱を除いた三柱で鑑定しています。</p>}
          {data.notice.nearTermBoundary && <p>※ 節入り（季節の切り替わり）に近いお生まれです。出生時刻によって月柱が変わる場合があります。</p>}
          <p>※ 鑑定は傾向を読むものであり、決まった運命を示すものではありません。</p>
          <p>※ 入力された生年月日はサーバーに保存していません。</p>
        </div>

        <ResultGuideLinks kind="saju" className="mt-6" />

        <div className="mt-6"><ShareButtons text="四柱推命で自分の命式を見てみた" /></div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/saju" className="rounded-full border border-[#3A3C6B] px-4 py-2 text-[13px] text-[#B8B4D9]">条件を変えて占う</Link>
          <Link href="/compat" className="rounded-full border border-[#3A3C6B] px-4 py-2 text-[13px] text-[#B8B4D9]">相性占いへ →</Link>
        </div>

        <div className="mt-6"><AdBanner slot="saju-bottom" /></div>
      </div>
    </div>
  );
}

/**
 * 일간 상징 이미지.
 * 서버가 넘겨준 src는 "빌드 시 실제로 존재가 확인된 파일"뿐이라 404가 나지 않는다.
 * src가 null이면(=이미지 미배치) 처음부터 이모지를 그린다.
 * 만약의 로딩 실패에도 이모지로 되돌아가므로 화면이 비는 일은 없다.
 */
function StemVisual({ src, emoji, char }: { src?: string | null; emoji?: string; char: string }) {
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" aria-hidden="true" onError={() => setBroken(true)} className="h-20 w-20 object-contain" />;
  }
  return (
    <span className="flex flex-col items-center leading-none">
      <span className="text-3xl" aria-hidden="true">{emoji ?? '✦'}</span>
      <span className="mt-1 text-2xl text-[#F5E6A8]" style={{ fontFamily: "'Shippori Mincho', serif" }}>{char}</span>
    </span>
  );
}

/** 오행 5각형 레이더 차트 (SVG, 외부 의존성 없음) */
function ElementRadar({ elements }: { elements: Record<string, number> }) {
  const size = 190, cx = size / 2, cy = size / 2 + 4, r = 58;
  const max = Math.max(3, ...ELEMENTS.map((e) => elements[e] ?? 0));
  const pt = (i: number, ratio: number): [number, number] => {
    const ang = (-90 + i * 72) * (Math.PI / 180);
    return [cx + Math.cos(ang) * r * ratio, cy + Math.sin(ang) * r * ratio];
  };
  const poly = ELEMENTS.map((e, i) => pt(i, (elements[e] ?? 0) / max).join(',')).join(' ');
  const grid = [0.34, 0.67, 1].map((g) => ELEMENTS.map((_, i) => pt(i, g).join(',')).join(' '));
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-[190px] w-[190px]" aria-hidden="true">
      {grid.map((g, i) => <polygon key={i} points={g} fill="none" stroke="#3A3C6B" strokeWidth="0.8" />)}
      {ELEMENTS.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#3A3C6B" strokeWidth="0.6" />;
      })}
      <polygon points={poly} fill="rgba(201,162,39,0.28)" stroke="#C9A227" strokeWidth="1.6" strokeLinejoin="round" />
      {ELEMENTS.map((e, i) => {
        const [x, y] = pt(i, 1.3);
        return (
          <text key={e} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fill="#F6F1E4" fontSize="13" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {e}
            <tspan x={x} dy="13" fontSize="10" fill="#8B8DBC">{elements[e] ?? 0}</tspan>
          </text>
        );
      })}
    </svg>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4">
      <p className="mb-2 text-[11px] tracking-widest text-[#C9A227]">✦ {title}</p>
      <p className="text-sm leading-relaxed text-[#E8E4F5]">{children}</p>
    </div>
  );
}
