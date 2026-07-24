// src/app/kaiun/page.tsx
// 開運日カレンダー
//
// 일본에서 「一粒万倍日」「天赦日」는 결혼·이사·개업·지갑 개시 날짜를 정할 때
// 실제로 쓰이는 생활 관습이고 검색량이 매우 크다.
// 계산은 역법(간지·절기)이라 AI가 필요 없고, 서버 렌더링이라 광고·색인에도 유리하다.
//
// 매달 자동으로 갱신되므로 관리 비용이 0이다(콘텐츠를 매달 쓰지 않아도 된다).
import Link from 'next/link';
import type { Metadata } from 'next';
import AdBanner from '@/components/AdBanner';
import { SITE_URL } from '@/lib/site';
import { getJstDateString } from '@/lib/daily';
import {
  kaiunMonth, kaiunDayOf, upcomingKaiun, tenshaDaysOfYear,
  KAIUN_INFO, type KaiunKind,
} from '@/lib/kaiunDay';

export const metadata: Metadata = {
  title: '開運日カレンダー — 一粒万倍日・天赦日はいつ？',
  description:
    '一粒万倍日・天赦日・寅の日・巳の日など、暦の吉日がひと目でわかるカレンダー。入籍やお財布の新調、新しいことを始める日選びにどうぞ。今日の開運日も毎日更新。',
  alternates: { canonical: '/kaiun' },
};

// 하루 한 번 갱신(날짜가 바뀌면 내용이 달라지므로)
export const revalidate = 3600;

const WEEK = ['日', '月', '火', '水', '木', '金', '土'];

const KIND_STYLE: Record<KaiunKind, string> = {
  tensha: 'bg-[#C9A227] text-[#14152B]',
  ichiryu: 'bg-[#C9A227]/25 text-[#F5E6A8]',
  tora: 'bg-[#3A3C6B] text-[#B8B4D9]',
  mi: 'bg-[#3A3C6B] text-[#B8B4D9]',
  kinoe_ne: 'bg-[#3A3C6B] text-[#B8B4D9]',
  fujoju: 'bg-[#4A2A3A] text-[#D9A0B4]',
};

export default function KaiunPage() {
  const today = getJstDateString();
  const [ty, tm, td] = today.split('-').map(Number);

  const todayInfo = kaiunDayOf(ty, tm, td);
  const days = kaiunMonth(ty, tm);
  const upcoming = upcomingKaiun(today, 5);
  const strongest = tenshaDaysOfYear(ty).filter((d) =>
    d.kinds.includes('tensha') && d.kinds.includes('ichiryu'));
  const leading = new Date(Date.UTC(ty, tm - 1, 1)).getUTCDay();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: metadata.title,
    description: metadata.description,
    inLanguage: 'ja',
    url: `${SITE_URL}/kaiun`,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="relative mx-auto max-w-md px-5 pb-14 pt-10 sm:max-w-2xl">
        <Link href="/" className="mb-4 inline-block text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</Link>

        <p className="text-[11px] tracking-[0.3em] text-[#C9A227]">KAIUN CALENDAR</p>
        <h1 className="mt-2 text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>開運日カレンダー</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#B8B4D9]">
          一粒万倍日や天赦日など、暦の上で縁起がよいとされる日をまとめました。
          入籍・引っ越し・開業・お財布の新調など、日取りを決めるときの目安にどうぞ。
        </p>

        {/* 오늘 */}
        <section className="mt-6 rounded-2xl border border-[#C9A227]/40 bg-gradient-to-b from-[#26284F] to-[#1A1B3A] p-5">
          <p className="text-[11px] tracking-widest text-[#C9A227]">✦ 今日</p>
          <p className="mt-2 text-xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {ty}年{tm}月{td}日（{WEEK[todayInfo.weekday]}）
            <span className="ml-2 text-sm text-[#8B8DBC]">{todayInfo.ganzhi}</span>
          </p>
          {todayInfo.kinds.length > 0 ? (
            <>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {todayInfo.kinds.map((k) => (
                  <span key={k} className={`rounded-full px-3 py-1 text-[12px] ${KIND_STYLE[k]}`}>
                    {KAIUN_INFO[k].ja}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-[#E8E4F5]">
                {KAIUN_INFO[todayInfo.kinds[0]].desc}
              </p>
            </>
          ) : (
            <p className="mt-3 text-[13px] leading-relaxed text-[#B8B4D9]">
              今日は特別な暦注のない日です。こういう日は、気負わず淡々と過ごすのがいちばん。
            </p>
          )}
        </section>

        {/* 이번 달 캘린더 */}
        <section className="mt-6">
          <h2 className="mb-3 text-lg" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {ty}年{tm}月の開運日
          </h2>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEK.map((w, i) => (
              <div key={w} className={`py-1.5 text-[11px] ${i === 0 ? 'text-[#D9808A]' : i === 6 ? 'text-[#8AA8D9]' : 'text-[#8B8DBC]'}`}>{w}</div>
            ))}
            {Array.from({ length: leading }).map((_, i) => <div key={`b${i}`} />)}
            {days.map((day) => {
              const isToday = day.d === td;
              const hasGood = day.kinds.some((k) => KAIUN_INFO[k].good);
              return (
                <div key={day.date}
                  className={`min-h-[58px] rounded-lg border p-1 ${
                    day.strongest ? 'border-[#C9A227] bg-[#C9A227]/20'
                    : hasGood ? 'border-[#3A3C6B] bg-[#1A1B3A]/70'
                    : 'border-transparent bg-[#1A1B3A]/30'
                  } ${isToday ? 'ring-1 ring-[#F5E6A8]' : ''}`}>
                  <div className={`text-[12px] ${isToday ? 'font-bold text-[#F5E6A8]' : 'text-[#F6F1E4]'}`}>{day.d}</div>
                  <div className="mt-0.5 flex flex-wrap justify-center gap-0.5">
                    {day.kinds.filter((k) => KAIUN_INFO[k].good).slice(0, 2).map((k) => (
                      <span key={k} className={`rounded px-1 text-[8px] leading-tight ${KIND_STYLE[k]}`}>
                        {KAIUN_INFO[k].short}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-[#5D5F91]">金色の枠は「天赦日と一粒万倍日が重なる日」です</p>
        </section>

        <div className="mt-6"><AdBanner slot="0000000000" /></div>

        {/* 다가오는 개운일 */}
        <section className="mt-6 rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4">
          <h2 className="mb-3 text-[11px] tracking-widest text-[#C9A227]">✦ 次の開運日</h2>
          <ul className="space-y-2">
            {upcoming.map((d) => (
              <li key={d.date} className="flex items-center gap-3 rounded-lg bg-[#14152B]/60 px-3 py-2.5">
                <span className="text-[13px] tabular-nums text-[#F6F1E4]">{d.m}/{d.d}</span>
                <span className="text-[11px] text-[#8B8DBC]">（{WEEK[d.weekday]}）</span>
                <span className="ml-auto flex flex-wrap justify-end gap-1">
                  {d.kinds.filter((k) => KAIUN_INFO[k].good).map((k) => (
                    <span key={k} className={`rounded-full px-2 py-0.5 text-[10px] ${KIND_STYLE[k]}`}>
                      {KAIUN_INFO[k].ja}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 올해 최강 개운일 */}
        {strongest.length > 0 && (
          <section className="mt-6 rounded-2xl border border-[#C9A227]/40 bg-[#1A1B3A]/70 p-4">
            <h2 className="mb-2 text-[11px] tracking-widest text-[#C9A227]">✦ {ty}年の最強開運日</h2>
            <p className="mb-3 text-[12px] leading-relaxed text-[#B8B4D9]">
              最上の吉日である天赦日と、小さな行動が大きく育つとされる一粒万倍日が重なる日です。年に数回しかありません。
            </p>
            <div className="flex flex-wrap gap-2">
              {strongest.map((d) => (
                <span key={d.date} className="rounded-lg bg-[#C9A227] px-3 py-1.5 text-[13px] font-medium text-[#14152B]">
                  {d.m}月{d.d}日（{WEEK[d.weekday]}）
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 용어 설명 */}
        <section className="mt-6 rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4">
          <h2 className="mb-3 text-[11px] tracking-widest text-[#C9A227]">✦ それぞれの意味</h2>
          <dl className="space-y-3">
            {(['tensha', 'ichiryu', 'tora', 'mi', 'kinoe_ne'] as KaiunKind[]).map((k) => {
              const info = KAIUN_INFO[k];
              return (
                <div key={k} className="border-l-2 border-[#C9A227]/40 pl-3">
                  <dt className="text-[14px] text-[#F5E6A8]">
                    {info.ja}<span className="ml-1.5 text-[11px] text-[#8B8DBC]">{info.reading}</span>
                  </dt>
                  <dd className="mt-0.5 text-[12px] leading-relaxed text-[#B8B4D9]">
                    {info.desc}
                    {info.suits.length > 0 && (
                      <span className="mt-1 block text-[11px] text-[#8B8DBC]">
                        向いていること：{info.suits.join('・')}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
          <p className="mt-4 text-[11px] leading-relaxed text-[#5D5F91]">
            ※ 暦注は日本に古くから伝わる慣習であり、結果を保証するものではありません。
            日取り選びの参考として、気持ちよく使っていただければと思います。
          </p>
        </section>

        {/* 회유 */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/saju" className="rounded-full border border-[#3A3C6B] px-4 py-2 text-[13px] text-[#B8B4D9]">四柱推命で本質を見る</Link>
          <Link href="/lucky" className="rounded-full border border-[#3A3C6B] px-4 py-2 text-[13px] text-[#B8B4D9]">今日のラッキーアイテム</Link>
          <Link href="/guide" className="rounded-full border border-[#3A3C6B] px-4 py-2 text-[13px] text-[#B8B4D9]">占いガイド</Link>
        </div>

        <div className="mt-6"><AdBanner slot="0000000000" /></div>
      </main>
    </div>
  );
}
