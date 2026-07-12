// src/app/aisho/page.tsx
// 星座相性チェッカー — 승인 전 고도화(C-3 라이트).
// 12星座 × 12星座를 4エレメント(火·地·風·水) 조합으로 판정하는 인터랙티브 툴.
//
// 설계:
//  - 정적 데이터 + 클라이언트 계산만 → 서버·AI 비용 $0
//  - 텍스트가 풍부한 인터랙티브 페이지 = 체류시간·AdSense 심사에 모두 유리
//  - 144조합을 얇은 개별 페이지로 만들지 않고(중복 콘텐츠 감점 위험),
//    한 페이지의 도구 + 상세 해설 + 가이드 글 연결로 구성
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AdBanner from '@/components/AdBanner';
import StarrySky from '@/components/StarrySky';

type Element = 'fire' | 'earth' | 'air' | 'water';

const SIGNS: { key: string; ja: string; date: string; el: Element }[] = [
  { key: 'aries', ja: '牡羊座', date: '3/21-4/19', el: 'fire' },
  { key: 'taurus', ja: '牡牛座', date: '4/20-5/20', el: 'earth' },
  { key: 'gemini', ja: '双子座', date: '5/21-6/21', el: 'air' },
  { key: 'cancer', ja: '蟹座', date: '6/22-7/22', el: 'water' },
  { key: 'leo', ja: '獅子座', date: '7/23-8/22', el: 'fire' },
  { key: 'virgo', ja: '乙女座', date: '8/23-9/22', el: 'earth' },
  { key: 'libra', ja: '天秤座', date: '9/23-10/23', el: 'air' },
  { key: 'scorpio', ja: '蠍座', date: '10/24-11/22', el: 'water' },
  { key: 'sagittarius', ja: '射手座', date: '11/23-12/21', el: 'fire' },
  { key: 'capricorn', ja: '山羊座', date: '12/22-1/19', el: 'earth' },
  { key: 'aquarius', ja: '水瓶座', date: '1/20-2/18', el: 'air' },
  { key: 'pisces', ja: '魚座', date: '2/19-3/20', el: 'water' },
];

const EL_JA: Record<Element, string> = { fire: '火', earth: '地', air: '風', water: '水' };

// 엘리먼트 조합 10종 (순서 무관). stars: 1~5
const PAIR: Record<string, { stars: number; title: string; text: string; advice: string }> = {
  'fire-fire': {
    stars: 4, title: '燃え上がる情熱コンビ',
    text: 'お互いの勢いとノリが噛み合い、一緒にいると行動力が倍増する組み合わせ。恋愛でも友情でも「思い立ったら即行動」で盛り上がります。その一方で、どちらも譲らない性質なので、衝突すると火花も大きめ。',
    advice: 'ぶつかったときは「勝ち負け」にしないこと。先に笑ったほうが二人の関係の勝者です。',
  },
  'fire-earth': {
    stars: 3, title: 'アクセルとブレーキの名タッグ（になれる）',
    text: '突き進む火と、着実に固める地。テンポの違いに最初は戸惑いますが、火の思いつきを地が現実化する役割分担ができると、単独では届かない場所へ行ける組み合わせです。',
    advice: '火側は「遅い」と急かさない、地側は「無謀」と切り捨てない。翻訳役はユーモアです。',
  },
  'fire-air': {
    stars: 5, title: '風が火を大きく育てる好相性',
    text: '風は火を煽って大きくする——占星術で古くから好相性とされる王道の組み合わせ。風のアイデアと社交性が火の情熱に方向を与え、会話も行動も軽やかに転がっていきます。',
    advice: '盛り上がりすぎて「言いっぱなし・やりっぱなし」になりがち。締めくくり役を交代制に。',
  },
  'fire-water': {
    stars: 2, title: '正反対だからこそ学びが多い',
    text: '情熱の火と感受性の水。テンションの高低差が大きく、火の勢いが水には強引に、水の繊細さが火にはまどろっこしく映ることも。ただし互いにない資質を持つため、尊重が生まれた瞬間から化学反応が起きます。',
    advice: '相手を「直そう」としないこと。違いは欠点ではなく、二人の守備範囲の広さです。',
  },
  'earth-earth': {
    stars: 4, title: 'ゆっくり深く根を張る安定コンビ',
    text: '価値観・金銭感覚・生活リズムが噛み合いやすく、時間をかけて信頼を積み上げる組み合わせ。派手さはなくても、気づけば誰より長続きしているタイプです。',
    advice: '安定が「マンネリ」に変わる前に、小さな初体験（新しい店・小旅行）を定期的に。',
  },
  'earth-air': {
    stars: 2, title: '現実派と理論派、翻訳が要るふたり',
    text: '目に見えるものを信じる地と、アイデアと会話を愛する風。話が噛み合わない瞬間はありますが、風の発想を地が形にできれば、仕事では特に強力なコンビになります。',
    advice: '「で、結論は？」と「まあ聞いて」の応酬になったら深呼吸。相手の結論の出し方を一度真似てみて。',
  },
  'earth-water': {
    stars: 5, title: '水が地を潤す、育ち合う好相性',
    text: '水は地を潤し、地は水の受け皿になる——こちらも王道の好相性。水の気配りが地の頑張りを癒やし、地の安定感が水の不安を受け止める、静かで深い信頼が育つ組み合わせです。',
    advice: '居心地が良すぎて言葉を省略しがち。「ありがとう」だけは省略しないのが長持ちのコツ。',
  },
  'air-air': {
    stars: 4, title: '会話が止まらない知的コンビ',
    text: '話題の引き出しとフットワークが似ていて、初対面から旧知のように盛り上がれる組み合わせ。距離感も互いにドライで心地よい一方、感情の深い部分に触れないまま進みやすい面も。',
    advice: 'たまには「楽しい話」ではなく「本音の話」を。月に一度の真面目な夜が関係を深めます。',
  },
  'air-water': {
    stars: 3, title: '理性と感情、歩み寄りで化ける',
    text: '言葉で考える風と、気持ちで感じる水。水が「察してほしい」場面で風が正論を返してすれ違うことも。ただ、風の軽やかさが水の重さをほぐし、水の深さが風に厚みを与える、育てがいのある関係です。',
    advice: '風側は結論の前に共感をひとこと。水側は察してもらう前に言葉に。それだけで別世界。',
  },
  'water-water': {
    stars: 4, title: '言葉のいらない共感コンビ',
    text: '空気と感情の機微を読み合える、しっとり深い組み合わせ。安心感は抜群ですが、二人ともネガティブな気分に同調しやすく、落ち込みの連鎖に入ることも。',
    advice: '沈む日はどちらかが「外の風」を入れる係に。散歩・映画・甘いもの、何でも効きます。',
  },
};

function pairKey(a: Element, b: Element): string {
  const order: Element[] = ['fire', 'earth', 'air', 'water'];
  return order.indexOf(a) <= order.indexOf(b) ? `${a}-${b}` : `${b}-${a}`;
}

function SignPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1">
      <p className="mb-2 text-center font-sans text-[11px] tracking-widest text-[#C9A227]">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {SIGNS.map((s) => (
          <button
            key={s.key}
            onClick={() => onChange(s.key)}
            className={`rounded-lg px-1 py-2 font-sans text-[11px] transition-colors ${
              value === s.key
                ? 'bg-[#C9A227] font-semibold text-[#14152B]'
                : 'border border-[#3A3C6B] text-[#B8B4D9] hover:border-[#C9A227]'
            }`}
          >
            {s.ja}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AishoPage() {
  const [me, setMe] = useState('aries');
  const [you, setYou] = useState('libra');

  const result = useMemo(() => {
    const a = SIGNS.find((s) => s.key === me)!;
    const b = SIGNS.find((s) => s.key === you)!;
    const p = PAIR[pairKey(a.el, b.el)];
    return { a, b, ...p };
  }, [me, you]);

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }}
      />
      <StarrySky />

      <div className="relative mx-auto max-w-2xl px-5 pb-16 pt-8">
        <Link href="/" className="font-sans text-xs text-[#8B8DBC] transition-colors hover:text-[#C9A227]">
          ✦ ホームに戻る
        </Link>

        <h1 className="mt-4 text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          星座相性チェッカー
        </h1>
        <p className="mt-2 text-center font-sans text-xs leading-relaxed text-[#8B8DBC]">
          ふたりの星座を選ぶと、4エレメント（火・地・風・水）で相性の傾向を診断します
        </p>

        {/* 픽커 */}
        <div className="mt-8 flex flex-col gap-6 sm:flex-row">
          <SignPicker label="あなた" value={me} onChange={setMe} />
          <SignPicker label="相手" value={you} onChange={setYou} />
        </div>

        {/* 결과 */}
        <div className="mt-8 rounded-2xl border border-[#C9A227]/40 bg-[#1A1B3A]/70 p-6">
          <p className="text-center font-sans text-[12px] text-[#B8B4D9]">
            {result.a.ja}（{EL_JA[result.a.el]}） × {result.b.ja}（{EL_JA[result.b.el]}）
          </p>
          <p className="mt-2 text-center text-xl tracking-widest text-[#F5E6A8]" aria-label={`相性 星${result.stars}つ`}>
            {'★'.repeat(result.stars)}
            <span className="text-[#3A3C6B]">{'★'.repeat(5 - result.stars)}</span>
          </p>
          <h2 className="mt-3 text-center text-lg" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {result.title}
          </h2>
          <p className="mt-4 font-sans text-[13px] leading-relaxed text-[#D8D5EE]">{result.text}</p>
          <div className="mt-4 rounded-xl border border-[#3A3C6B] bg-[#14152B]/60 p-4">
            <p className="font-sans text-[10px] tracking-widest text-[#C9A227]">✦ ふたりへのワンポイント</p>
            <p className="mt-2 font-sans text-[13px] leading-relaxed text-[#D8D5EE]">{result.advice}</p>
          </div>
          <p className="mt-4 text-center">
            <Link
              href="/flow?mode=fortune"
              className="inline-block rounded-full bg-[#C9A227] px-6 py-2 font-sans text-[13px] font-semibold text-[#14152B]"
            >
              今日のあなたの運勢も占う →
            </Link>
          </p>
        </div>

        {/* SEO 텍스트 콘텐츠 (도구만으로 얇아지지 않게) */}
        <section className="mt-10 space-y-4 font-sans text-[14px] leading-relaxed text-[#C9C6E0]">
          <h2 className="text-base font-semibold text-[#F6F1E4]">エレメント相性の考え方</h2>
          <p>
            西洋占星術では、12星座を<strong className="text-[#F6F1E4]">火・地・風・水</strong>の
            4つのエレメント（元素）に分類します。火（牡羊・獅子・射手）は情熱と行動、
            地（牡牛・乙女・山羊）は現実と安定、風（双子・天秤・水瓶）は知性とコミュニケーション、
            水（蟹・蠍・魚）は感情と共感を象徴します。
          </p>
          <p>
            伝統的に「火と風」「地と水」は互いを活かし合う好相性、同じエレメント同士は
            価値観が通じ合う安心の相性、「火と水」「地と風」はテンポの違いから歩み寄りが
            必要な相性とされます。ただしこれはあくまで傾向の話——星3つ以下の組み合わせでも、
            違いを面白がれるふたりなら、同エレメント以上に刺激的な関係になります。
          </p>
          <p>
            もっと詳しく知りたい方は
            <Link href="/guide/zodiac-compatibility" className="text-[#C9A227] underline underline-offset-4">
              12星座の相性 — エレメントで見る恋愛・友情の傾向
            </Link>
            もあわせてどうぞ。
          </p>
        </section>

        <AdBanner slot="0000000000" />

        <p className="mt-6 text-center font-sans text-[10px] text-[#5D5F91]">
          ※ 本コンテンツはエンターテインメントを目的としています
        </p>
      </div>
    </div>
  );
}
