// src/app/guide/blood-type-personality/page.tsx
// 【下書き③】血液型でわかる性格の傾向
// ⚠️ 公開前に一度読み、あなたの体験を1〜2段落足してください(AI丸写しは審査で不利)。
// 調査根拠: 日本の各媒体で共通する通説 + 「科学的根拠は証明されていない」明記が最新の標準。

import GuideArticle from '@/components/GuideArticle';

export const metadata = {
  title: '血液型でわかる性格の傾向 — A・B・O・AB型の特徴',
  description:
    'A型・B型・O型・AB型それぞれに語られる性格イメージと相性の傾向を、文化的背景とともにやさしく紹介。会話のきっかけになる血液型占いの入門ガイドです。',
};

const TYPES = [
  ['A型', '几帳面・真面目・協調性', 'responsibility',
    '几帳面で responsibility 感が強く、周囲との調和を大切にするタイプとされます。ルールや約束を重んじ「しっかり者」「信頼できる」と見られがち。一方で、慎重すぎて優柔不断になったり、細かいことを気に病みやすい面も語られます。'],
  ['B型', '自由奔放・マイペース・好奇心', 'freedom',
    '自分の興味に全力を注ぐ、自由で創造的なタイプとされます。他人に流されずマイペースで、新しいことへの行動力は随一。その反面「気分屋」「自己中心的」と誤解されることもありますが、本来は人との違いを楽しむ柔軟さが持ち味と言われます。'],
  ['O型', 'おおらか・社交的・リーダー気質', 'leadership',
    '明るく社交的で、人との距離を縮めるのが得意なタイプとされます。困っている人を放っておけず、場をまとめる力があると言われる一方、大らかさゆえに「大雑把」と見られたり、恋愛では独占欲が強く出ることもあるとされます。'],
  ['AB型', '合理的・二面性・ミステリアス', 'balance',
    'A型とB型の性質を併せ持つとされ、冷静で合理的な分析家タイプと言われます。人との距離感を大切にし、独自のセンスを持つ一方、「何を考えているかわからない」「二面性がある」と評されることも。心を許した相手には深い情を見せるとされます。'],
];

const AISHOU = [
  ['A型 × A型', '価値観が似て安定。几帳面さがぶつかると窮屈にも。'],
  ['A型 × O型', 'O型の包容力がA型を安心させ、長続きしやすい組み合わせ。'],
  ['B型 × O型', 'O型がB型の自由を受け止める、ストレスの少ない相性。'],
  ['AB型 × A型', '慎重同士でじっくり。落ち着いた信頼関係を築きやすい。'],
];

export default function BloodTypePage() {
  return (
    <GuideArticle
      category="血液型 / 入門"
      title="血液型でわかる性格の傾向 — A・B・O・AB型の特徴"
      description={metadata.description}
      slug="blood-type-personality"
    >
      <p>
        「あの子はやっぱりA型だよね」——日本では血液型の話題が、会話のきっかけとして今も根強い人気があります。
        血液型性格とは<strong>「血液型ごとに考え方や行動に一定の傾向が見られる」</strong>という考え方で、
        人となりを知る一つの目安として親しまれてきました。
      </p>

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>血液型占いの傾向を知りたい方</li>
          <li>「らしくない」と言われたことがある方</li>
          <li>血液型の話題を人間関係に活かしたい方</li>
        </ul>
      </div>
      <p>
        はじめに大切な前提を。血液型と性格の関連には<strong>医学的・心理学的な科学的根拠は証明されていません</strong>。
        あくまでコミュニケーションのきっかけ、エンターテインメントの一つとして楽しむのがおすすめです。
        そのうえで、日本で広く語られる各型のイメージを見ていきましょう。
      </p>

      <h2>4つの血液型の性格イメージ</h2>
      <ul className="space-y-2 !mt-2">
        {TYPES.map(([name, kw, , desc]) => (
          <li key={name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{name}</span>
            <span className="ml-2 text-xs text-indigo-300">{kw}</span>
            <p className="mt-1 text-sm text-slate-300">{desc}</p>
          </li>
        ))}
      </ul>

      <h2>相性の傾向（一例）</h2>
      <p>相性もあくまで通説の一つ。「当たっているかも」と楽しむ程度がちょうど良い距離感です。</p>
      <ul className="space-y-2 !mt-2">
        {AISHOU.map(([pair, note]) => (
          <li key={pair} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{pair}</span>
            <p className="mt-1 text-sm text-slate-300">{note}</p>
          </li>
        ))}
      </ul>

      <h2>「らしくない」と言われる人のほうが多い</h2>
      <p>
        血液型占いの話題でよく出るのが、
        「自分は言われている特徴に当てはまらない」という声です。
        初対面で血液型を当てられたことがない、という人も珍しくありません。
        4つに分ける以上、当てはまらない人が出るのはごく自然なことです。
      </p>
      <p>
        それでも血液型の話が盛り上がるのは、当たるからというより、
        相手を知りたいという気持ちのきっかけになるからでしょう。
        「〇型だから」で終わらせず、そこから一歩踏み込んで話せたときがいちばん面白い——
        当サービスも、その距離感で血液型を扱っています。
      </p>

      <h2>血液型占いとの付き合い方</h2>
      <p>
        血液型は「その人のすべてを決めるもの」ではありません。育った環境や経験で性格は大きく変わります。
        <strong>「A型だからこう」と決めつける</strong>のではなく、相手を知るきっかけ、自分を見つめ直すヒントとして、
        軽やかに楽しむのが血液型占いの上手な使い方です。
      </p>

      <h2>「当てはまらない」ときに見るポイント</h2>
      <p>
        血液型の説明がしっくりこないとき、多くの場合は「場面によって出る顔が違う」ことが原因です。職場での自分と、家での自分は別人のようだ——という声はとてもよく聞かれます。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">場面</th><th className="px-3 py-2 text-left">よく出る顔</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">初対面</td><td className="px-3 py-2">本来の性格より、慎重な顔が出やすい</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">気の合う友人といるとき</td><td className="px-3 py-2">いちばん素の顔に近い</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">責任のある立場</td><td className="px-3 py-2">本来と逆の顔を演じることがある</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">疲れているとき</td><td className="px-3 py-2">素の傾向が強く出る</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 血液型の説明が当たるかどうかは、「どの場面の自分と比べたか」で変わります。</p>


      <h2>よくある質問</h2>
      <h3>Q. 血液型で性格は本当に決まるの？</h3>
      <p>
        科学的に証明されたものではありません。あくまで文化として親しまれてきた分類です。4つに分ける以上、当てはまらない人が出るのは当たり前で、「らしくない」と言われる人のほうが多いくらいです。
      </p>
      <h3>Q. それでも占う意味はありますか？</h3>
      <p>
        相手を知ろうとするきっかけとしては役に立ちます。大事なのは「〇型だから」で終わらせないことです。そこから一歩踏み込んで、その人自身の話を聞けたときがいちばん面白いところです。
      </p>
      <h3>Q. 相手の血液型を聞くのは失礼？</h3>
      <p>
        国や相手によっては、血液型で人を判断することを不快に感じる方もいます。初対面でいきなり聞くより、話の流れで出たときに軽く触れる程度がおすすめです。
      </p>

      <h2>ホシドタロでの扱い方</h2>
      <p>
        当サービスでは、血液型を単独では使いません。星座と組み合わせた48パターンの「性格診断」として、また相性占いの一要素として使っています。4分類だけでは大ざっぱすぎるからです。あくまで人物像に厚みを足すための一要素、という位置づけで扱っています。
      </p>

    </GuideArticle>
  );
}
