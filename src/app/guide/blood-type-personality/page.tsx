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

      {/* ↓↓↓ ここにあなたの体験を1〜2段落 ↓↓↓ */}

      <h2>血液型占いとの付き合い方</h2>
      <p>
        血液型は「その人のすべてを決めるもの」ではありません。育った環境や経験で性格は大きく変わります。
        <strong>「A型だからこう」と決めつける</strong>のではなく、相手を知るきっかけ、自分を見つめ直すヒントとして、
        軽やかに楽しむのが血液型占いの上手な使い方です。
      </p>
    </GuideArticle>
  );
}
