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

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>2026年後半の流れをつかんでおきたい方</li>
          <li>自分の星座の傾向を知りたい方</li>
          <li>年運の使い方がわからない方</li>
        </ul>
      </div>

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

      <h2>年運は「予定表」ではなく「天気予報」</h2>
      <p>
        一年の傾向を読むときに気をつけたいのが、細かく覚えようとしないことです。
        内容を暗記するほど、その通りになったかどうかに意識が向いてしまい、
        かえって行動が縛られてしまうという声があります。
      </p>
      <p>
        使いこなしている人に多いのは、キーワードを一つか二つだけ書き留めておく方法です。
        迷ったときに立ち返る目印になり、判断が少し早くなると言われます。
        傘を持つかどうかを決めるための天気予報のように、
        年運はそのくらいの距離感がちょうどよいのだと思います。
      </p>

      <h2>エレメント別・下半期の過ごし方メモ</h2>
      <p>
        一年の傾向は覚えようとすると縛られます。キーワードを一つだけ持っておく、くらいがちょうどいい距離です。手帳の最初のページに書き写しておくと、迷ったときに立ち返れます。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">エレメント</th><th className="px-3 py-2 text-left">下半期のキーワード</th><th className="px-3 py-2 text-left">意識したいこと</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">火</td><td className="px-3 py-2">広げるより、選ぶ</td><td className="px-3 py-2">手を出す数を減らして一つに集中</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">地</td><td className="px-3 py-2">守りから、育てる</td><td className="px-3 py-2">積み上げたものを人に見せる機会を作る</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">風</td><td className="px-3 py-2">つなぐより、深める</td><td className="px-3 py-2">広く浅い縁より、長く付き合いたい相手を大事に</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">水</td><td className="px-3 py-2">受け止めて、手放す</td><td className="px-3 py-2">抱え込んだものを一度整理する</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 良い傾向・悪い傾向というより、「今どの季節にいるか」として読むのがおすすめです。</p>


      <h2>よくある質問</h2>
      <h3>Q. 年運はどう使えばいいですか？</h3>
      <p>
        キーワードを1つか2つだけ書き留めておく、という使い方がおすすめです。細かく覚えようとすると、その通りになったかどうかに意識が向いてしまい、かえって行動が縛られます。迷ったときに立ち返る目印くらいがちょうどいい距離です。
      </p>
      <h3>Q. 悪い傾向と書かれていたら？</h3>
      <p>
        年運は「一年ずっとそう」という意味ではありません。波のどのあたりにいるかを示すもので、下がる時期は整える時期でもあります。種をまく年と、刈り取る年が違うのと同じです。
      </p>
      <h3>Q. 自分の星座以外も見ていい？</h3>
      <p>
        ぜひ見てください。家族や同僚の傾向を知っておくと、「今この人はこういう時期なんだな」と受け止めやすくなります。相手を変えようとせずに済むぶん、関係が楽になります。
      </p>

      <h2>もっと細かく見たい方へ</h2>
      <p>
        年単位の流れよりもう一段細かく知りたい方は、当サービスの「四柱推命」をお試しください。生年月日から10年ごとの流れ（大運）を出せるので、いま自分がどのあたりにいるかがわかります。さらに、その日ごとの運（日運）も毎日変わるので、年・10年・1日という三つの物差しで見比べられます。
      </p>


      <h2>まとめ</h2>
      <p>
        エレメントの傾向はあくまで大きな流れの目安です。日々の細かい運勢は
        「今日の運勢」で星座とタロットを組み合わせて占い、下半期全体の過ごし方は
        エレメントの傾向を参考にする——そんな使い分けもおすすめです。
      </p>
    </GuideArticle>
  );
}
