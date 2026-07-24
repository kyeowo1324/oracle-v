// src/app/guide/zodiac-compatibility/page.tsx
// 【下書き⑦】12星座の相性
// ⚠️ 公開前に体験を1〜2段落追加。
// 根拠: 西洋占星術のエレメント(火・地・風・水)による相性の基本理論。

import GuideArticle from '@/components/GuideArticle';

export const metadata = {
  title: '12星座の相性 — エレメントで見る恋愛・友情の傾向',
  description:
    '星座の相性を「火・地・風・水」の4エレメントからやさしく解説。同じエレメント同士や相性の良い組み合わせ、うまく付き合うコツを紹介します。',
};

const ELEMENTS = [
  ['火のグループ', '牡羊座・獅子座・射手座', '情熱的で行動的。同じ火同士は勢いで意気投合。風のグループと好相性で、火を大きくする関係。'],
  ['地のグループ', '牡牛座・乙女座・山羊座', '現実的で堅実。安定を好み、水のグループと相性が良く、じっくり信頼を育てる関係。'],
  ['風のグループ', '双子座・天秤座・水瓶座', '知的でコミュニケーション上手。火のグループと刺激し合い、軽やかに関係を広げる。'],
  ['水のグループ', '蟹座・蠍座・魚座', '感受性豊かで共感力が高い。地のグループに安心を感じ、深く情緒的な絆を結ぶ。'],
];

export default function ZodiacCompatPage() {
  return (
    <GuideArticle
      category="星座 / 相性"
      title="12星座の相性 — エレメントで見る恋愛・友情の傾向"
      description={metadata.description}
      slug="zodiac-compatibility"
    >
      <p>
        星座占いで相性を見るとき、鍵になるのが<strong>4つのエレメント（火・地・風・水）</strong>です。
        12星座は3つずつこの4グループに分かれ、同じグループや相性の良いグループ同士で、
        自然と波長が合いやすいとされています。
      </p>

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>気になる相手との相性を知りたい方</li>
          <li>相性が悪いと言われて気になっている方</li>
          <li>エレメント（火・地・風・水）の考え方を知りたい方</li>
        </ul>
      </div>

      <h2>4つのエレメント</h2>
      <ul className="space-y-2 !mt-2">
        {ELEMENTS.map(([name, signs, desc]) => (
          <li key={name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{name}</span>
            <span className="ml-2 text-xs text-indigo-300">{signs}</span>
            <p className="mt-1 text-sm text-slate-300">{desc}</p>
          </li>
        ))}
      </ul>

      <h2>相性の基本パターン</h2>
      <p>
        一般に、<strong>同じエレメント同士</strong>は価値観が似て居心地が良く、
        <strong>火と風／地と水</strong>は互いを高め合う好相性とされます。
        逆にエレメントが遠い組み合わせは、違いが大きいぶん刺激的でもあり、
        理解し合えれば成長できる関係になります。相性は「良い・悪い」ではなく、
        付き合い方のヒントとして捉えるのがおすすめです。
      </p>

      <h2>「相性が悪い」まま長く続く関係</h2>
      <p>
        エレメントの相性でいえば噛み合わないとされる組み合わせなのに、
        長く続いている——そういう関係は珍しくありません。
        話を聞いてみると、合わない部分がなくなったわけではなく、
        「どこが違うか」が早い段階ではっきりしていた、という共通点があります。
      </p>
      <p>
        違いがわかっていると、相手に的外れな期待をかけずに済みます。
        先に決めたい人と、迷いながら決めたい人。急ぎたい人と、間を置きたい人。
        相性の知識は、合わない相手を避けるためではなく、
        違いを責めずに扱うために役立つものだと、当サービスでは考えています。
      </p>

      <h2>すれ違いが起きやすい場面と対処</h2>
      <p>
        相性の良し悪しは、日常のどんな場面で表に出るのでしょうか。よくあるすれ違いを、エレメントの違いから整理してみます。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">組み合わせ</th><th className="px-3 py-2 text-left">ありがちなすれ違い</th><th className="px-3 py-2 text-left">対処のヒント</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">火 × 地</td><td className="px-3 py-2">早く決めたい vs 慎重に決めたい</td><td className="px-3 py-2">締め切りだけ先に決めておく</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">風 × 水</td><td className="px-3 py-2">理屈で話す vs 気持ちで話す</td><td className="px-3 py-2">まず共感してから本題に入る</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">火 × 水</td><td className="px-3 py-2">勢いで進む vs 傷つきやすい</td><td className="px-3 py-2">結論の前に一言クッションを置く</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">地 × 風</td><td className="px-3 py-2">手順を守る vs 自由にやりたい</td><td className="px-3 py-2">守る部分だけ決めて残りは任せる</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 相性が悪いのではなく、速度と優先順位が違うだけ、というケースがほとんどです。</p>

      <h2>相性を「良し悪し」で見ないための考え方</h2>
      <p>
        相性表を見るとき、多くの人が「良いか悪いか」だけを探してしまいます。けれど実際の関係で問題になるのは、良し悪しよりも「どこで速度が食い違うか」です。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">よくある食い違い</th><th className="px-3 py-2 text-left">火・風タイプ</th><th className="px-3 py-2 text-left">地・水タイプ</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">決めるまでの速さ</td><td className="px-3 py-2">その場で決めたい</td><td className="px-3 py-2">持ち帰って考えたい</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">連絡の頻度</td><td className="px-3 py-2">思いついたら送る</td><td className="px-3 py-2">まとめて送る</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">予定の立て方</td><td className="px-3 py-2">ざっくり決めたい</td><td className="px-3 py-2">細かく決めたい</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">問題が起きたとき</td><td className="px-3 py-2">すぐ話し合いたい</td><td className="px-3 py-2">一度距離を置きたい</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ どちらが正しいという話ではありません。違いを先に知っておくと、相手を責めずに済みます。</p>
      <h2></h2>
      <p>
        相性の知識がいちばん役に立つのは、うまくいっているときではなく、すれ違ったときです。「この人は考える時間が要るタイプだった」と思い出せるだけで、待てるようになります。相性表は、そのための備忘録だと考えてください。
      </p>



      <h2>よくある質問</h2>
      <h3>Q. 相性が悪いと言われたら諦めるべき？</h3>
      <p>
        いいえ。相性表は「合う・合わない」を判定するものではなく、「どこが違うか」を先に教えてくれるものです。違いがわかっていれば、相手に的外れな期待をかけずに済みます。実際、相性が下位とされる組み合わせで長く続いている関係はたくさんあります。
      </p>
      <h3>Q. 同じ星座同士はどうですか？</h3>
      <p>
        感覚が近いので楽な反面、同じところでつまずきやすいという面もあります。二人とも先延ばしにする、二人とも譲らない、といった具合です。似ている相手ほど、役割を分けておくとうまくいきやすいでしょう。
      </p>
      <h3>Q. 星座だけで相性は決まりますか？</h3>
      <p>
        決まりません。星座はあくまで大まかな傾向です。当サービスでも、星座に加えて血液型やタロットを組み合わせて読むようにしています。要素が増えるほど、その二人だけの形に近づきます。
      </p>

      <h2>ホシドタロの相性占い</h2>
      <p>
        当サービスの「相性占い」では、二人の星座と血液型に加えて、タロットを4枚引きます。恋愛・友人・仕事など、どの関係を占うかによって読み方を変えているのも特徴です。同じ二人でも、恋人として見るのか同僚として見るのかで、活きる部分と気をつける部分は変わってくるからです。
      </p>


      <h2>まとめ</h2>
      <p>
        エレメントを知ると、相手との違いの理由が見えてきます。
        「このエレメントだからこう感じるのか」と分かるだけで、人間関係はぐっと楽になります。
        まずは自分と身近な人のエレメントを調べてみましょう。
      </p>
    </GuideArticle>
  );
}
