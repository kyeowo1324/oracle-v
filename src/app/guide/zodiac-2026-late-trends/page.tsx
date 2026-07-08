// src/app/guide/zodiac-2026-late-trends/page.tsx
// 【下書き】星座別 2026年下半期の傾向 — 時事性のある読み物
// エレメント単位の大まかな傾向のみを扱い、日付が古くなりにくい書き方にしてあります。
// 月ごとの詳細は /fortune-2026 に誘導。

import Link from 'next/link';
import GuideArticle from '@/components/GuideArticle';

export const metadata = {
  title: '星座別 2026年下半期の傾向 — 4エレメントで見る過ごし方のヒント',
  description:
    '2026年下半期（7月〜12月）を、火・地・風・水の4エレメントごとの傾向でやさしく整理。月ごとの詳細運勢は月別運勢ページもあわせてご覧ください。',
};

const ELEMENTS = [
  {
    name: '火のエレメント', signs: '牡羊座・獅子座・射手座',
    desc: '行動力と情熱が持ち味の3星座。下半期は新しいことに挑戦する意欲が高まりやすい時期。勢いだけで突き進むと息切れしやすいので、無理のないペース配分を意識すると力を発揮しやすくなります。',
  },
  {
    name: '地のエレメント', signs: '牡牛座・乙女座・山羊座',
    desc: '着実さと計画性が強みの3星座。下半期は積み上げてきたことが少しずつ形になりやすいタイミング。焦らず、これまでのペースを維持することが結果につながりやすい時期です。',
  },
  {
    name: '風のエレメント', signs: '双子座・天秤座・水瓶座',
    desc: 'コミュニケーションと柔軟性が持ち味の3星座。下半期は人との出会いや情報のやり取りが増えやすい傾向。新しい人間関係やアイデアが、今後の展開のきっかけになりやすい時期です。',
  },
  {
    name: '水のエレメント', signs: '蟹座・蠍座・魚座',
    desc: '感受性と直感の鋭さが特徴の3星座。下半期は自分の気持ちと向き合う時間が増えやすい時期。無理に周囲に合わせるより、自分の感覚を大切にすることで良い流れをつかみやすくなります。',
  },
];

export default function Zodiac2026TrendsPage() {
  return (
    <GuideArticle
      category="星座 / 2026年"
      title="星座別 2026年下半期の傾向 — 4エレメントで見る過ごし方のヒント"
      description={metadata.description}
      slug="zodiac-2026-late-trends"
    >
      <p>
        12星座は<strong>火・地・風・水</strong>の4つのエレメント（元素）に分類され、
        同じエレメントの星座同士は似た気質や過ごし方の傾向を持つといわれます。
        ここでは2026年下半期（7月〜12月）を、エレメントごとの大まかな傾向として整理しました。
      </p>

      <h2>4エレメントの下半期の傾向</h2>
      <ul className="space-y-2 !mt-2">
        {ELEMENTS.map((e) => (
          <li key={e.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{e.name}</span>
            <span className="ml-2 text-xs text-indigo-300">{e.signs}</span>
            <p className="mt-1 text-sm text-slate-300">{e.desc}</p>
          </li>
        ))}
      </ul>

      <h2>もっと詳しく知りたい方へ</h2>
      <p>
        ここでは大きな傾向のみをご紹介しましたが、当サイトでは
        <strong>月ごとの12星座別運勢</strong>もまとめています。今月・来月の詳しい傾向を
        知りたい方は、下記の月別運勢ページもあわせてご覧ください。
      </p>
      <p>
        <Link href="/fortune-2026" className="text-indigo-300 underline">
          2026年 月別運勢を見る →
        </Link>
      </p>

      {/* ↓↓↓ ここにあなたの体験や所感を1〜2段落 ↓↓↓ */}

      <h2>まとめ</h2>
      <p>
        エレメントの傾向はあくまで大きな流れの目安です。日々の細かい運勢は
        「今日の運勢」で星座とタロットを組み合わせて占い、下半期全体の過ごし方は
        エレメントの傾向を参考にする——そんな使い分けもおすすめです。
      </p>
    </GuideArticle>
  );
}
