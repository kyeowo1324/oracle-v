// src/app/guide/tarot-seiza-kumiawase/page.tsx
import GuideArticle from '@/components/GuideArticle';

export const metadata = {
  title: 'タロットと星座の組み合わせ方 — 2つの占いを重ねて読むコツ',
  description:
    '星座占いとタロットは実は深い関係。大アルカナと12星座の対応表、2つの占いを組み合わせて読み解く実践的な方法を解説します。',
};

const SIGN_CARDS: [string, string, string][] = [
  ['牡羊座', '皇帝', 'リーダーシップ・決断'],
  ['牡牛座', '法王', '継続・価値観'],
  ['双子座', '恋人', '選択・コミュニケーション'],
  ['蟹座', '戦車', '感情の推進力・守る強さ'],
  ['獅子座', '力', '勇気・自信'],
  ['乙女座', '隠者', '分析・内省'],
  ['天秤座', '正義', 'バランス・公平'],
  ['蠍座', '死神', '変容・再生'],
  ['射手座', '節制', '調和・探求'],
  ['山羊座', '悪魔', '野心・執着との向き合い'],
  ['水瓶座', '星', '希望・革新'],
  ['魚座', '月', '直感・想像力'],
];

export default function TarotSeizaKumiawasePage() {
  return (
    <GuideArticle
      category="タロット / 応用"
      title="タロットと星座の組み合わせ方 — 2つの占いを重ねて読むコツ"
      description={metadata.description}
      slug="tarot-seiza-kumiawase"
    >
      <p>
        星座占いとタロット、どちらも楽しんでいる方は多いと思いますが、
        実はこの2つ、<strong>もともと深くつながっています</strong>。
        西洋占星術の12星座は、タロットの大アルカナと伝統的に対応づけられており、
        2つを重ねて読むと、それぞれ単体では見えなかった立体的なメッセージが
        浮かび上がります。
      </p>

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>タロットと星座を組み合わせて読みたい方</li>
          <li>大アルカナと12星座の対応を知りたい方</li>
          <li>占いをもう一段深く楽しみたい方</li>
        </ul>
      </div>

      <h2>大アルカナと12星座の対応</h2>
      <p>
        黄金の夜明け団に由来する伝統的な対応では、大アルカナ22枚のうち
        12枚が各星座に割り当てられています。自分の星座のカードは
        「生まれ持ったテーマ」を象徴するとされます。
      </p>
      <ul className="space-y-2 !mt-2">
        {SIGN_CARDS.map(([sign, card, theme]) => (
          <li key={sign} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{sign} × {card}</span>
            <p className="mt-1 text-sm text-slate-300">{theme}</p>
          </li>
        ))}
      </ul>
      <p>
        たとえば蠍座と「死神」の組み合わせは一見不穏ですが、
        意味するのは「終わらせて生まれ変わる力」。深い変容を恐れない
        蠍座の本質そのものです。自分の星座のカードを知っておくと、
        占いでそのカードが出たとき「これは自分への直球のメッセージだ」と
        受け取れるようになります。
      </p>

      <h2>組み合わせ読みの実践 — 3つのステップ</h2>
      <p>
        <strong>ステップ1：星座占いで「流れ」を掴む。</strong>
        星座占いは天体の動きに基づくので、「今週は対人運が追い風」のような
        大きな流れを教えてくれます。まず流れを把握しましょう。
      </p>
      <p>
        <strong>ステップ2：タロットで「今日の具体策」を引く。</strong>
        タロットは引いたその瞬間の状況を映すのが得意です。
        星座占いが「追い風」と言っている週に「隠者」が出たら、
        「流れは良いが、今日は根回しや準備に使うと吉」と読める——
        流れ（星座）と一手（タロット）の役割分担です。
      </p>
      <p>
        <strong>ステップ3：矛盾したときは「条件つき」で読む。</strong>
        星座占いは絶好調なのにタロットは「塔」——そんな日もあります。
        矛盾ではなく「チャンスは大きいが、足元の確認を怠ると崩れる」のように、
        <strong>好調の中の注意点</strong>として統合するのがコツです。
      </p>

      <h2>当サービスの占いも、この考え方でできています</h2>
      <p>
        <a href="/flow?mode=fortune">今日の運勢</a>では、あなたの星座から
        大きな流れを、タロット3枚から今日の具体的な展開を読み、
        AIが2つを統合した総合メッセージを組み立てます。
        この記事の対応表を頭に入れてから結果を読むと、
        「なぜこのカードとこの星座でこの結論になるのか」が
        より深く味わえるはずです。
      </p>

      <h2>自分の星座のカードが出たときの感じ方</h2>
      <p>
        対応表を知ってからタロットを引くと、
        自分の星座に対応する大アルカナが出た瞬間に手が止まる、という声をよく聞きます。
        偶然だとわかっていても、名指しされたような感覚があるようです。
      </p>
      <p>
        2つの占いを重ねる面白さは、答えが増えることではありません。
        同じことを別の言い方で言われる場面に出会えることです。
        星座が「あなたはこういう性質」と伝え、タロットが「いまはこういう場面」と伝える。
        重なったときに、その言葉は一段深く届きます。
      </p>

      <h2>対応表（大アルカナ×12星座）</h2>
      <p>
        大アルカナのうち12枚は、12星座と対応づけられています。全部を覚える必要はありません。まずは自分の星座に対応する1枚だけ知っておくと、それが出たときに気づけるようになります。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">星座</th><th className="px-3 py-2 text-left">カード</th><th className="px-3 py-2 text-left">星座</th><th className="px-3 py-2 text-left">カード</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">牡羊座</td><td className="px-3 py-2">皇帝</td><td className="px-3 py-2">天秤座</td><td className="px-3 py-2">正義</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">牡牛座</td><td className="px-3 py-2">法王</td><td className="px-3 py-2">蠍座</td><td className="px-3 py-2">死神</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">双子座</td><td className="px-3 py-2">恋人</td><td className="px-3 py-2">射手座</td><td className="px-3 py-2">節制</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">蟹座</td><td className="px-3 py-2">戦車</td><td className="px-3 py-2">山羊座</td><td className="px-3 py-2">悪魔</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">獅子座</td><td className="px-3 py-2">力</td><td className="px-3 py-2">水瓶座</td><td className="px-3 py-2">星</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">乙女座</td><td className="px-3 py-2">隠者</td><td className="px-3 py-2">魚座</td><td className="px-3 py-2">月</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 流派によって対応が異なる場合があります。ここでは広く使われている対応を載せています。</p>


      <h2>よくある質問</h2>
      <h3>Q. 対応表は覚えないとだめですか？</h3>
      <p>
        覚えなくても大丈夫です。自分の星座に対応する1枚だけ知っておけば、それが出たときに「お、来た」と気づけます。全部を暗記するより、その1枚を入り口にするほうが続きます。
      </p>
      <h3>Q. 星座とタロットで結果が食い違ったら？</h3>
      <p>
        食い違いこそ読みどころです。星座は「あなたはこういう性質」、タロットは「いまはこういう場面」を語ります。性質と場面がずれているときは、無理をしている時期かもしれません。
      </p>
      <h3>Q. 組み合わせると当たりやすくなる？</h3>
      <p>
        当たる確率が上がるというより、同じことを別の言い方で確認できる、という感覚に近いです。二つの占いが同じ方向を指したときは、その言葉が一段深く届きます。
      </p>

      <h2>ホシドタロはこの考え方でできています</h2>
      <p>
        当サービスの「今日の運勢」は、まさに星座とタロットを重ねて読む仕組みです。星座から生まれ持った傾向を、タロットからその日の場面を読み取り、最後に一つの結論としてまとめています。血液型を加えるとさらに絞り込まれるので、余力があれば入れてみてください。
      </p>


      <h2>まとめ</h2>
      <p>
        星座は「流れ」、タロットは「一手」。2つを重ねると、
        占いはただの吉凶判断から、今日をどう動くかの作戦会議に変わります。
        まずは対応表で、自分の星座のカードを確認してみてください。
      </p>
    </GuideArticle>
  );
}
