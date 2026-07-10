// src/app/share/page.tsx
// ホシドタロ — 공유 링크 랜딩 페이지
//
// SNS에 붙여넣으면 og:image(/api/og)가 미리보기로 뜨고,
// 링크를 직접 열면 같은 정보를 페이지로 보여준다.
// ⚠️ DB 고정 해설은 표시하지 않는다 — 카드 이미지 + AI 텍스트만.
//
// 수정 1: searchParams를 `any`로 받고 await 처리 → Next 14(객체)와
//        Next 15+(Promise) 어느 버전에서도 타입체크·런타임 모두 통과.
//        (await은 Promise가 아닌 값에 써도 그 값을 그대로 반환하므로 안전)
// 수정 2: decodeURIComponent 제거 — searchParams가 이미 디코딩된 값을 주므로
//        추가 디코딩하면 '%' 포함 텍스트에서 URIError가 발생할 수 있음.

import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';

type ShareParams = {
  type?: string;
  card?: string;
  orientation?: string;
  image?: string;
  text?: string;
  verdict?: string;
};

function normalize(raw: Record<string, string | string[] | undefined>): ShareParams {
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return {
    type: pick(raw.type),
    card: pick(raw.card),
    orientation: pick(raw.orientation),
    image: pick(raw.image),
    text: pick(raw.text),
    verdict: pick(raw.verdict),
  };
}

function buildOgUrl(sp: ShareParams) {
  const params = new URLSearchParams();
  if (sp.type) params.set('type', sp.type);
  if (sp.card) params.set('card', sp.card);
  if (sp.orientation) params.set('orientation', sp.orientation);
  if (sp.image) params.set('image', sp.image);
  if (sp.text) params.set('text', sp.text);
  if (sp.verdict) params.set('verdict', sp.verdict);
  return `${SITE_URL}/api/og?${params.toString()}`;
}

export async function generateMetadata({ searchParams }: any): Promise<Metadata> {
  const sp = normalize(await searchParams);
  const ogImage = buildOgUrl(sp);
  const title =
    sp.type === 'decision' ? 'ホシドタロ — する・しない占いの結果' : 'ホシドタロ — 今日の運勢';
  const description = sp.text || '星座とタロットで占う、今日のあなたの運勢。';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'ホシドタロ' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharePage({ searchParams }: any) {
  const sp = normalize(await searchParams);
  const isDecision = sp.type === 'decision';
  const verdictColor =
    sp.verdict === 'する' ? '#4ADE80' : sp.verdict === 'しない' ? '#F87171' : '#C9A227';

  return (
    <div
      className="relative min-h-screen px-6 py-12"
      style={{
        background:
          'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)',
      }}
    >
      <div className="mx-auto max-w-md text-center">
        <p className="text-[13px] tracking-[0.3em] text-[#C9A227]">
          {isDecision ? 'する・しない占い' : '今日の運勢'}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#F6F1E4]">ホシドタロ</h1>

        {sp.image && (
          <div className="relative mx-auto mt-8 aspect-[3/5] w-48 overflow-hidden rounded-xl ring-1 ring-[#C9A227]/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sp.image}
              alt={sp.card ?? 'tarot card'}
              className={`h-full w-full object-cover ${sp.orientation === 'reversed' ? 'rotate-180' : ''}`}
            />
          </div>
        )}
        {sp.card && (
          <p className="mt-3 text-sm text-[#C9A227]">
            {sp.card}（{sp.orientation === 'reversed' ? '逆位置' : '正位置'}）
          </p>
        )}

        {isDecision && sp.verdict && (
          <p className="mt-6 text-4xl font-bold" style={{ color: verdictColor }}>
            {sp.verdict}
          </p>
        )}

        {sp.text && (
          <p className="mx-auto mt-6 max-w-sm text-[15px] leading-relaxed text-[#F6F1E4]">
            {sp.text}
          </p>
        )}

        <Link
          href="/"
          className="mt-10 inline-block rounded-full bg-[#C9A227] px-8 py-3 text-[14px] font-semibold text-[#14152B]"
        >
          自分も占ってみる
        </Link>
      </div>
    </div>
  );
}
