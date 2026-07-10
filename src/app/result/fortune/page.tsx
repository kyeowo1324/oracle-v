// src/app/result/fortune/page.tsx
// A+B+F 결과 + 실제 AdBanner + ShareButtons(LINE·X·Threads·복사·네이티브)
// + 이미지 공유(ShareResultImage) + 링크 미리보기(/share URL)
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdBanner from '@/components/AdBanner';
import ShareButtons from '@/components/ShareButtons';
import ShareResultImage from '@/components/ShareResultImage';
import FortuneTellerLoader from '@/components/FortuneTellerLoader';
import ZoomableTarotCard from '@/components/ZoomableTarotCard';
import StarrySky from '@/components/StarrySky';
import { markFreeViewUsed } from '@/lib/dailyGate';
import { buildShareUrl } from '@/lib/shareLink';
import { recordCards, extractCardKey } from '@/lib/collection';
import DailyLimitScreen from '@/components/DailyLimitScreen';

const ZODIAC_JA: Record<string, string> = {
  aries: '牡羊座', taurus: '牡牛座', gemini: '双子座', cancer: '蟹座', leo: '獅子座', virgo: '乙女座',
  libra: '天秤座', scorpio: '蠍座', sagittarius: '射手座', capricorn: '山羊座', aquarius: '水瓶座', pisces: '魚座',
};

// 選んだテーマに合わせて関連ガイド記事へ誘導(내부링크 + 체류시간)
const RELATED_GUIDE: Record<string, { slug: string; title: string }> = {
  general: { slug: 'how-to-read-daily-fortune', title: '今日の運勢の見方をもっと詳しく' },
  love: { slug: 'tarot-love-reading', title: 'タロットで占う恋愛のヒントをもっと見る' },
  money: { slug: 'lucky-color-number', title: 'ラッキーカラー・ナンバーの活用法を見る' },
  work: { slug: 'tarot-three-card-spread', title: 'タロット3枚引きの読み方を詳しく知る' },
  health: { slug: 'kaiun-habits', title: '毎日できる開運習慣をチェックする' },
  relationship: { slug: 'zodiac-compatibility', title: '星座の相性についてもっと知る' },
};

export default function FortuneResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState(false);
  const [limited, setLimited] = useState(false);
  const [meta, setMeta] = useState<any>({});

  useEffect(() => {
    const tarotFull = JSON.parse(sessionStorage.getItem('tarotFull') ?? '[]');
    const m = JSON.parse(sessionStorage.getItem('fortuneMeta') ?? '{}');
    setMeta(m);
    if (!tarotFull.length) { router.replace('/'); return; }

    (async () => {
      try {
        const res = await fetch('/api/fortune/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: m.topic ?? 'general',
            zodiacSign: m.zodiacSign, bloodType: m.bloodType, gender: m.gender,
            tarotShuffleResult: tarotFull, lang: 'ja',
          }),
        });
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : null;
        if (res.status === 429 || data?.error === 'rate_limited') setLimited(true);
        else if (!data || data.error) setError(true);
        else {
          setResult(data);
          // 컬렉션(도감)에 기록 — 실패해도 본기능에 영향 없음
          try {
            recordCards('original', (data.tarot ?? []).map((c: any) => ({
              key: extractCardKey(c),
              name: c.name,
              orientation: c.orientation,
              imageUrl: c.image_url,
            })));
          } catch { /* noop */ }
        }
      } catch (e) {
        console.error('fortune fetch failed:', e);
        setError(true);
      } finally {
        setLoading(false);
        markFreeViewUsed('fortune'); // 오늘의 무료 조회 사용 처리(다음 입장부터 광고 게이트 대상)
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <FortuneTellerLoader message="占っています" />;
  }
  if (limited) {
    return <DailyLimitScreen />;
  }
  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#14152B] px-6 text-center">
        <div>
          <p className="text-sm text-[#B8B4D9]">結果の取得に失敗しました。<br />もう一度お試しください。</p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={() => router.push('/flow?mode=fortune')} className="rounded-lg bg-[#C9A227] px-5 py-2 text-sm text-[#14152B]">もう一度</button>
            <button onClick={() => router.push('/')} className="rounded-lg border border-[#3A3C6B] px-5 py-2 text-sm text-[#B8B4D9]">ホーム</button>
          </div>
        </div>
      </div>
    );
  }

  const lucky = result.lucky ?? {};
  const shareText = `私の今日の${result.topicJa}は「${result.conclusion || '運勢チェック'}」🔮 #ホシドタロ #今日の運勢`;

  // 공유용: AI 생성 텍스트만 사용 (DB 고정 해설 c.text는 절대 사용 금지)
  const shareAiText: string = result.summary || result.conclusion || '';
  const shareCards = (result.tarot ?? []).slice(0, 3).map((c: any, i: number) => ({
    imageUrl: c.image_url,
    name: c.name,
    orientation: c.orientation,
    position: c.position ?? ['過去', '現在', '未来'][i],
  }));
  const firstCard = result.tarot?.[0];
  // 링크 미리보기(/share)용 URL — ShareButtons(LINE·X·복사 등)가 이 링크를 공유
  const shareUrl = firstCard
    ? buildShareUrl({
        type: 'fortune',
        cardName: firstCard.name,
        orientation: firstCard.orientation,
        imageUrl: firstCard.image_url,
        aiText: shareAiText,
      })
    : undefined;

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto max-w-md px-6 pb-16 pt-6">
        <button onClick={() => router.push('/')} className="mb-2 text-xs text-[#8B8DBC] transition-colors hover:text-[#C9A227]">
          ✦ ホームに戻る
        </button>

        <p className="text-center text-xs tracking-widest text-[#C9A227]">{result.topicJa}</p>
        <h1 className="mt-1 text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>今日の運勢</h1>
        <p className="mt-2 text-center text-[11px] tracking-widest text-[#8B8DBC]">
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* ① 결론 먼저 — 장식 프레임 + 라벨 + 별 구분선 */}
        {(result.conclusion || result.summary) && (
          <section className="relative mt-8 rounded-xl bg-gradient-to-b from-[#26284F] to-[#1A1B3A] px-5 pb-6 pt-8 ring-1 ring-[#C9A227]/30">
            {/* 모서리 장식 (좌상/우하) */}
            <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 rounded-tl-lg border-l border-t border-[#C9A227]/60" />
            <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 rounded-br-lg border-b border-r border-[#C9A227]/60" />

            {/* 라벨 칩 (프레임 상단 중앙에 걸침) */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[#C9A227]/50 bg-[#14152B] px-4 py-1 text-[10px] tracking-[0.25em] text-[#C9A227]">
              ✦ 本日の結論 ✦
            </span>

            {result.conclusion && (
              <p className="text-center text-xl font-medium leading-relaxed text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>
                {result.conclusion}
              </p>
            )}

            {result.conclusion && result.summary && (
              /* 별 구분선 */
              <div className="my-4 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C9A227]/50" />
                <span className="text-xs text-[#C9A227]">✦</span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C9A227]/50" />
              </div>
            )}

            {result.summary && (
              <p className="text-sm leading-[1.9] text-[#F0EDDD]">{result.summary}</p>
            )}
          </section>
        )}

        {/* 광고 1: 결론 아래 */}
        <AdBanner slot="0000000000" />

        {/* ② 별자리 + 럭키 */}
        <section className="mt-2">
          <h2 className="text-sm font-medium text-[#C9A227]">星座の{result.topicJa}</h2>
          {result.hasZodiac ? (
            <div className="mt-3 rounded-xl bg-[#1A1B3A]/70 p-4">
              <p className="text-xs text-[#C9A227]">{ZODIAC_JA[meta.zodiacSign ?? ''] ?? ''}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#D8D5EE]">{result.zodiacText}</p>
              {result.zodiacAdvice && (
                <p className="mt-3 rounded-lg bg-[#26284F] px-3 py-2 text-xs text-[#F0EDDD]">💫 {result.zodiacAdvice}</p>
              )}
              {(lucky.color || lucky.number != null || lucky.item) && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {lucky.color && (<div className="rounded-lg bg-[#26284F] py-2"><p className="text-[10px] text-[#8B8DBC]">ラッキーカラー</p><p className="mt-0.5 text-xs text-[#F6F1E4]">{lucky.color}</p></div>)}
                  {lucky.number != null && (<div className="rounded-lg bg-[#26284F] py-2"><p className="text-[10px] text-[#8B8DBC]">ラッキーナンバー</p><p className="mt-0.5 text-xs text-[#F6F1E4]">{lucky.number}</p></div>)}
                  {lucky.item && (<div className="rounded-lg bg-[#26284F] py-2"><p className="text-[10px] text-[#8B8DBC]">ラッキーアイテム</p><p className="mt-0.5 text-xs text-[#F6F1E4]">{lucky.item}</p></div>)}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-[#3A3C6B] p-4 text-center text-xs text-[#8B8DBC]">星座はスキップされました</div>
          )}
        </section>

        {/* ③ 타로 3장 (첫 카드 다음 광고) */}
        <section className="mt-8">
          <h2 className="text-sm font-medium text-[#C9A227]">タロット（過去・現在・未来）</h2>
          <div className="mt-3 space-y-6">
            {result.tarot.map((c: any, i: number) => (
              <div key={i}>
                <div className="rounded-xl bg-[#1A1B3A]/70 p-4">
                  <p className="mb-3 text-center text-xs tracking-widest text-[#C9A227]">{c.position}</p>
                  <ZoomableTarotCard card={c} widthClass="w-36" />
                  <p className="mt-3 text-center text-xs text-[#C9A227]">{c.name}（{c.orientation === 'upright' ? '正位置' : '逆位置'}）</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#D8D5EE]">{c.text}</p>
                </div>
                {/* 광고 2: 첫 카드(과거) 다음 */}
                {i === 0 && <AdBanner slot="0000000000" />}
              </div>
            ))}
          </div>
        </section>

        {/* ④ 혈액형 */}
        {result.blood && (
          <div className="mt-8 rounded-xl bg-[#1A1B3A]/70 p-4">
            <h3 className="text-sm font-medium text-[#C9A227]">🩸 血液型（参考）</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#D8D5EE]">{result.blood.text}</p>
          </div>
        )}

        {/* 관련 가이드 링크 (내부링크 + 체류시간) */}
        {(() => {
          const rg = RELATED_GUIDE[meta.topic ?? 'general'] ?? RELATED_GUIDE.general;
          return (
            <Link
              href={`/guide/${rg.slug}`}
              className="mt-8 flex items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-3 text-sm text-[#D8D5EE] transition-colors hover:border-[#C9A227]"
            >
              <span>📖 {rg.title}</span>
              <span className="text-[#C9A227]">→</span>
            </Link>
          );
        })()}

        {/* 공유 — ① 이미지 공유 + ② 링크 공유(미리보기 포함) */}
        <div className="mt-10 space-y-4">
          {shareCards.length > 0 && (
            <ShareResultImage
              type="fortune"
              cards={shareCards}
              conclusion={result.conclusion}
              summary={result.summary}
            />
          )}
          <ShareButtons text={shareText} url={shareUrl} />
        </div>

        {/* 이동 */}
        <div className="mt-8 flex gap-3">
          <button onClick={() => router.push('/flow?mode=fortune')} className="flex-1 rounded-lg bg-[#C9A227] py-3 text-sm font-medium text-[#14152B]">もう一度占う</button>
          <button onClick={() => router.push('/flow?mode=decision')} className="flex-1 rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9] hover:border-[#C9A227]">する・しない →</button>
        </div>

        <p className="mt-8 text-center text-[11px] text-[#5D5F91]">本サービスはエンターテインメント目的です</p>

        {/* 광고 3: 하단 공통 */}
        <AdBanner slot="0000000000" />
      </div>
    </div>
  );
}
