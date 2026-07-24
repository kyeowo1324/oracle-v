// src/app/guide/tarot-basics/page.tsx
// 【サンプル記事②】タロット入門 — GuideArticle 사용판
//
// ⚠️ 公開前に: 一度読んで、あなたの言葉・体験を1〜2段落足してください。

import GuideArticle from '@/components/GuideArticle';

export const metadata = {
  title: 'タロット占いの基本 — 大アルカナと正位置・逆位置の読み方',
  description:
    'タロットの大アルカナ22枚の意味、正位置と逆位置の違い、初心者向けの1枚引き（ワンオラクル）のやり方をやさしく解説します。',
};

const MAJORS = [
  ['愚者', '始まり・自由・可能性'],
  ['魔術師', '創造・意志・行動力'],
  ['女教皇', '直感・知性・秘密'],
  ['女帝', '豊かさ・愛情・母性'],
  ['皇帝', '安定・責任・リーダーシップ'],
  ['恋人', '選択・愛・調和'],
  ['戦車', '前進・勝利・意志の力'],
  ['力', '勇気・忍耐・内なる強さ'],
  ['隠者', '内省・探求・孤独'],
  ['運命の輪', '転機・巡り合わせ・変化'],
  ['正義', '公正・バランス・決断'],
  ['吊るされた男', '試練・視点の転換・忍耐'],
  ['死神', '終わりと再生・変容'],
  ['節制', '調和・節度・融合'],
  ['悪魔', '執着・欲望・束縛'],
  ['塔', '崩壊・衝撃・解放'],
  ['星', '希望・理想・癒し'],
  ['月', '不安・幻想・直感'],
  ['太陽', '成功・喜び・活力'],
  ['審判', '復活・決断・目覚め'],
  ['世界', '完成・達成・統合'],
];

export default function TarotBasicsPage() {
  return (
    <GuideArticle
      category="タロット / 入門"
      title="タロット占いの基本 — 大アルカナと正位置・逆位置の読み方"
      description={metadata.description}
      slug="tarot-basics"
    >
      <p>
        タロットは、78枚のカードを使って心の奥にある答えを言葉にしていく占いです。
        なかでも<strong>大アルカナ22枚</strong>は、人生の大きなテーマや流れを象徴する、
        タロットの中心となるカードです。初心者はまずこの22枚から親しむのがおすすめです。
      </p>

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>タロットを始めてみたい方</li>
          <li>78枚の意味を覚えられずに挫折した方</li>
          <li>まず何から手をつけるか知りたい方</li>
        </ul>
      </div>

      <h2>正位置と逆位置</h2>
      <p>
        タロットは、引いたカードの上下の向きで意味が変わります。
        正しく見える向きが<strong>正位置</strong>、上下逆さまが<strong>逆位置</strong>です。
        一般に正位置はそのカードの意味が素直に、逆位置は控えめ・過剰・停滞といった形で表れます。
        たとえば「太陽」は正位置なら成功や喜び、逆位置なら喜びが少し曇る、といった具合です。
      </p>

      <h2>大アルカナ22枚のキーワード</h2>
      <p>まずは各カードの代表的なイメージをつかみましょう。</p>
      <ul className="space-y-2 !mt-2">
        {MAJORS.map(([name, kw]) => (
          <li key={name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{name}</span>
            <p className="mt-1 text-sm text-slate-300">{kw}</p>
          </li>
        ))}
      </ul>

      <h2>1枚引き（ワンオラクル）のやり方</h2>
      <p>
        もっとも手軽なのが、カードを1枚だけ引く「ワンオラクル」です。
        「はい・いいえ」で答えられる質問を思い浮かべ、よく混ぜてから1枚を選びます。
        出たカードの意味と向きから、答えやヒントを読み取ります。当サービスの
        <strong>「する・しない」</strong>は、このワンオラクルの考え方をもとにしています。
      </p>

      <h2>意味を覚えるより先に、絵を眺める</h2>
      <p>
        タロットを始めた人がつまずきやすいのが、
        78枚（あるいは大アルカナ22枚）の意味を先に暗記しようとするやり方です。
        量が多いうえ、覚えた言葉に引っぱられて、目の前のカードが見えなくなってしまいます。
      </p>
      <p>
        続いている人がよくすすめるのは、意味を調べる前に絵を一分ほど眺め、
        感じたことを一言だけメモしてから解説を読む、という順番です。
        あとから意味を読むと、自分のメモと重なる部分が意外と多いことに気づきます。
        カードを読む力の入り口は、知識よりも先に、自分の感覚の側にあるのかもしれません。
      </p>

      <h2>大アルカナ22枚をざっくりつかむ</h2>
      <p>
        22枚を一度に覚えるのは大変なので、まずは3つのかたまりに分けて眺めてみてください。物語の流れとして見ると、意味がつながって記憶に残りやすくなります。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">グループ</th><th className="px-3 py-2 text-left">カード</th><th className="px-3 py-2 text-left">大まかなテーマ</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">始まり</td><td className="px-3 py-2">愚者〜女帝あたり</td><td className="px-3 py-2">出発、直感、育てる</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">試練</td><td className="px-3 py-2">皇帝〜死神あたり</td><td className="px-3 py-2">責任、選択、手放し</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">再生</td><td className="px-3 py-2">節制〜世界あたり</td><td className="px-3 py-2">調整、希望、完成</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 細かい意味は後回しで構いません。まず「今どのあたりの話か」がつかめれば十分です。</p>

      <h2>引く前に決めておく3つのこと</h2>
      <p>
        タロットが読みにくくなる原因のほとんどは、カードではなく引き方にあります。引く前にこの3つを決めておくだけで、結果がぐっと読みやすくなります。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">決めること</th><th className="px-3 py-2 text-left">理由</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">何を知りたいか（1つだけ）</td><td className="px-3 py-2">質問が複数あると、どのカードがどれの答えか分からなくなります</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">何枚引くか</td><td className="px-3 py-2">途中で足すと、都合のいい結果を探すことになります</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">どんな結果でも受け止める</td><td className="px-3 py-2">先に決めておくと、解釈がぶれません</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 特に1つ目が大事です。「彼の気持ちと、私の今後と、仕事運」を一度に聞くと、必ずぼやけます。</p>
      <h2></h2>
      <p>
        もう一つ、初心者がつまずきやすいのが「同じ質問を何度も引いてしまう」ことです。納得できる答えが出るまで引き直したくなりますが、引くほど混乱するのが実際のところです。同じことが気になるなら、質問の立て方を変えるほうが早く前に進めます。
      </p>



      <h2>よくある質問</h2>
      <h3>Q. 78枚すべて覚えないと占えませんか？</h3>
      <p>
        覚えなくても大丈夫です。まずは大アルカナ22枚だけで十分に読めます。それも暗記から入るより、絵を1分ほど眺めて感じたことをメモしてから意味を調べる順番のほうが、結果的に早く身につきます。
      </p>
      <h3>Q. カードは買わないとダメですか？</h3>
      <p>
        紙とペンでも練習できますし、当サービスのようなオンラインのタロットでも構いません。実物のカードには手に取る楽しさがありますが、最初から高価なデッキを選ぶ必要はまったくありません。
      </p>
      <h3>Q. 自分で自分を占ってもいいの？</h3>
      <p>
        問題ありません。ただし、答えを決めてから引くと都合よく読んでしまいがちです。引く前に「どんな答えが出ても受け止める」と一度決めておくと、読みがぶれにくくなります。
      </p>

      <h2>ホシドタロで練習する</h2>
      <p>
        当サービスの「する・しない」では、カードを1枚引いてYes/Noに近い形で答えを出します。カードの絵と意味が並べて表示されるので、練習にもちょうどいい形です。占い師を切り替えると同じカードでも言い方が変わるので、「この絵はこうも読めるのか」という発見にもつながります。
      </p>


      <h2>まとめ</h2>
      <p>
        タロットは「当てる」ものというより、自分の気持ちを映す鏡のような存在です。
        まずは大アルカナのキーワードを眺め、気になったカードから親しんでみてください。
      </p>
    </GuideArticle>
  );
}
