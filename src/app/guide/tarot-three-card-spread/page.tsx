// src/app/guide/tarot-three-card-spread/page.tsx
// 【下書き⑤】3枚引き（過去・現在・未来）の読み方
// ⚠️ 公開前に体験を1〜2段落追加。

import GuideArticle from '@/components/GuideArticle';

export const metadata = {
  title: 'タロット3枚引きの読み方 — 過去・現在・未来スプレッド',
  description:
    '初心者でも扱いやすいタロットの3枚引き（過去・現在・未来）。カードの並べ方から、3枚をひとつの物語としてつなげて読むコツまでやさしく解説します。',
};

const POS = [
  ['① 過去', '左のカード', '今の状況の背景・原因。ここまでの流れや、あなたが抱えてきたテーマを表します。'],
  ['② 現在', '中央のカード', '今まさに置かれている状況・気持ち。相談の核心にあたる最も重要な1枚です。'],
  ['③ 未来', '右のカード', 'このまま進んだ場合の見通し・可能性。決定した結末ではなく「傾向」として読みます。'],
];

export default function ThreeCardPage() {
  return (
    <GuideArticle
      category="タロット / 実践"
      title="タロット3枚引きの読み方 — 過去・現在・未来スプレッド"
      description={metadata.description}
      slug="tarot-three-card-spread"
    >
      <p>
        1枚引き（ワンオラクル）に慣れたら、次におすすめなのが
        <strong>3枚引き（スリーカード）</strong>です。3枚を「過去・現在・未来」の順に並べ、
        時間の流れとして読み解きます。シンプルながら物語性があり、初心者にも扱いやすい定番スプレッドです。
      </p>

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>3枚引きのやり方を知りたい方</li>
          <li>3枚目だけを見て落ち込んでしまう方</li>
          <li>カードをつなげて読むコツを知りたい方</li>
        </ul>
      </div>

      <h2>並べ方と各位置の意味</h2>
      <ul className="space-y-2 !mt-2">
        {POS.map(([name, place, desc]) => (
          <li key={name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{name}</span>
            <span className="ml-2 text-xs text-indigo-300">{place}</span>
            <p className="mt-1 text-sm text-slate-300">{desc}</p>
          </li>
        ))}
      </ul>

      <h2>3枚を「つなげて」読むコツ</h2>
      <p>
        3枚引きの醍醐味は、カードを1枚ずつバラバラに見るのではなく、
        <strong>ひとつの物語としてつなげる</strong>ことです。
        「過去にこういう流れがあり、今この状況で、このまま進むとこうなりそう」と、
        左から右へ一本のストーリーを描くように読みます。逆位置が混じったら、
        その部分に停滞や課題があると受け取ると自然です。
      </p>

      <h2>3枚目だけを見てしまう、という落とし穴</h2>
      <p>
        3枚引きを覚えたばかりの頃に起きやすいのが、
        「未来」の位置のカードだけを見て一喜一憂してしまうことです。
        そこが望まないカードだと、前の2枚を読まないまま落ち込んで終わってしまいます。
      </p>
      <p>
        3枚引きの本当の値打ちは、つなげて読んだときに現れます。
        1枚目と2枚目を並べてみると、3枚目は決定ではなく
        「この流れのままいくとこうなる」という注意書きとして見えてきます。
        流れの続きだとわかってしまえば、未来のカードはもう怖いものではなくなります。
      </p>

      <h2>目的別・3枚の並べ方</h2>
      <p>
        3枚引きは並べ方を変えるだけで、まったく違う質問に使えます。大事なのは引く前に決めておくこと。あとから変えると、都合よく読んでしまいます。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">並べ方</th><th className="px-3 py-2 text-left">向いている質問</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">過去 / 現在 / 未来</td><td className="px-3 py-2">流れを知りたいとき</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">原因 / 現状 / 対策</td><td className="px-3 py-2">問題を解きほぐしたいとき</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">自分 / 相手 / 関係</td><td className="px-3 py-2">人間関係を見たいとき</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">選択A / 選択B / 助言</td><td className="px-3 py-2">二択で迷っているとき</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 三枚目だけを見ないこと。1枚目と2枚目を並べてから読むと、意味が変わって見えます。</p>

      <h2>つなげて読む練習——1枚ずつ足していく</h2>
      <p>
        3枚をつなげて読むのが難しいのは、いきなり3枚を見ようとするからです。1枚ずつ言葉にしてから足していくと、自然に一つの話になります。実際にやってみましょう。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">手順</th><th className="px-3 py-2 text-left">やること</th><th className="px-3 py-2 text-left">例</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">①</td><td className="px-3 py-2">1枚目だけを一言で</td><td className="px-3 py-2">「準備が足りていない」</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">②</td><td className="px-3 py-2">2枚目を足して一文に</td><td className="px-3 py-2">「準備が足りないまま、今動こうとしている」</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">③</td><td className="px-3 py-2">3枚目で結ぶ</td><td className="px-3 py-2">「このまま進むと空回りしそう。先に整えるほうがいい」</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 「だから」「でも」「そのうえで」といったつなぎ言葉を入れると、一気に文章になります。</p>
      <h2></h2>
      <p>
        つなげて読めないときは、無理をしないでください。「今はまだ全体像が見えていない」というメッセージとして受け取り、日を改めるほうが自然な答えが出ます。カードは逃げませんし、答えを急いでも良いことはありません。
      </p>



      <h2>よくある質問</h2>
      <h3>Q. 3枚の並べ方に決まりはありますか？</h3>
      <p>
        一般的には左から「過去・現在・未来」ですが、「原因・現状・対策」「自分・相手・関係」など、目的に合わせて変えて構いません。大事なのは引く前に決めておくことです。あとから変えると読みが甘くなります。
      </p>
      <h3>Q. 未来のカードが悪かったら？</h3>
      <p>
        3枚目は決定ではなく「このままいくとこうなる」という注意書きです。前の2枚とつなげて読むと、どこで流れを変えられるかが見えてきます。3枚目だけを取り出して落ち込むのは、いちばんもったいない読み方です。
      </p>
      <h3>Q. 3枚がバラバラでつながらない時は？</h3>
      <p>
        無理につなげなくて大丈夫です。「今はまだ全体像が見えていない」というメッセージとして受け取り、日を改めて引き直すほうが自然な答えが出ます。
      </p>

      <h2>ホシドタロでの3枚引き</h2>
      <p>
        当サービスの「今日の運勢」では、タロットを3枚使って読み解いています。1枚ずつの意味だけでなく、3枚を通した流れとして結論を出しているのが特徴です。カードは毎回シャッフルされるので、同じ日でも引き直すと違う組み合わせになります。
      </p>


      <h2>まとめ</h2>
      <p>
        3枚引きは、状況を時間軸で整理したいときに最適です。
        当サービスの「今日の運勢」でもこの過去・現在・未来の3枚を採用しています。
        まずは気軽に3枚を引いて、物語を紡ぐ感覚を楽しんでみてください。
      </p>
    </GuideArticle>
  );
}
