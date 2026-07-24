// src/components/ResultGuideLinks.tsx
// 결과 화면 → 가이드 글 연결.
//
// 왜 필요한가:
//   결과를 본 사용자는 "그래서 이게 무슨 뜻이지?"라는 궁금증이 가장 큰 순간에 있다.
//   그런데 지금까지 결과 화면에서 읽을거리로 가는 길이 사실상 없었다(4개 중 1개만 링크 1개).
//   여기서 글로 보내면 두 가지를 동시에 얻는다.
//     - 체류·페이지뷰 증가 → 광고 노출 증가
//     - 도구 페이지 → 글 방향의 내부링크 → 글의 검색 평가 상승
//
// 비용 0(정적 링크). 어떤 결과였는지에 따라 어울리는 글이 달라지도록 문맥별로 묶었다.

import Link from 'next/link';
import { GUIDE_ARTICLES } from '@/data/guides';

/** 결과 화면의 종류 */
export type ResultKind = 'fortune' | 'decision' | 'compat' | 'saju';

/** 화면별로 "지금 궁금할 만한" 글 slug를 우선순위대로 */
const PREFERRED: Record<ResultKind, string[]> = {
  fortune: ['how-to-read-daily-fortune', 'astrology-basics', 'lucky-color-number', 'asa-uranai-shukan'],
  decision: ['tarot-basics', 'gyakui-no-yomikata', 'tarot-three-card-spread', 'what-is-uranai'],
  compat: ['zodiac-compatibility', 'aisho-zodiac-ranking', 'blood-type-personality', 'renai-tarot-spread'],
  saju: ['what-is-uranai', 'astrology-basics', 'kaiun-habits', 'moon-uranai'],
};

const HEADING: Record<ResultKind, string> = {
  fortune: '運勢をもっと深く読むために',
  decision: 'カードの意味をもっと知る',
  compat: '相性をもっと深く知る',
  saju: '占いをもっと楽しむために',
};

export default function ResultGuideLinks({
  kind,
  max = 3,
  className = '',
}: {
  kind: ResultKind;
  max?: number;
  className?: string;
}) {
  const published = new Map(GUIDE_ARTICLES.filter((a) => a.published).map((a) => [a.slug, a]));
  const items = PREFERRED[kind]
    .map((slug) => published.get(slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .slice(0, max);

  if (items.length === 0) return null;

  return (
    <section className={`rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-4 ${className}`}>
      <p className="mb-3 text-[11px] tracking-widest text-[#C9A227]">✦ {HEADING[kind]}</p>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/guide/${a.slug}`}
              className="block rounded-lg bg-[#14152B]/60 px-3 py-2.5 transition-colors hover:bg-[#26284F]"
            >
              <p className="text-[13px] font-medium leading-snug text-[#F6F1E4]">{a.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#8B8DBC]">{a.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/guide"
        className="mt-3 inline-block text-[12px] text-[#C9A227] underline-offset-4 hover:underline"
      >
        占いガイドをすべて見る →
      </Link>
    </section>
  );
}
