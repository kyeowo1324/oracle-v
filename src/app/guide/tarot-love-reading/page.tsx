// src/app/guide/tarot-love-reading/page.tsx
// 【下書き⑨】タロットで占う恋愛
// ⚠️ 公開前に体験を1〜2段落追加。
// 根拠: 恋愛タロットでよく参照される大アルカナの象意。

import GuideArticle from '@/components/GuideArticle';

export const metadata = {
  title: 'タロットで占う恋愛 — 相手の気持ちを読み解くヒント',
  description:
    '恋愛タロットで気になる相手の気持ちや関係の行方を読み解くコツを解説。恋愛でよく登場するカードの意味と、結果との向き合い方を紹介します。',
};

const LOVE_CARDS = [
  ['恋人', '正: 相思相愛・良い選択　逆: 迷い・すれ違い', '恋愛タロットの象徴。二人の心が通う可能性や、選択のときを示します。'],
  ['カップのエース', '正: 愛の芽生え・満たされる　逆: 愛の渇望', '新しい恋や感情の始まりを表す、恋愛で嬉しいカードのひとつ。'],
  ['女帝', '正: 豊かな愛情・包容　逆: 過保護・依存', '愛され、育む関係を示します。母性的なやさしさの象徴。'],
  ['月', '正: 不安・曖昧さ　逆: 霧が晴れる', 'はっきりしない気持ちや隠れた本音。読み手の直感が試されるカード。'],
];

export default function TarotLovePage() {
  return (
    <GuideArticle
      category="タロット / 恋愛"
      title="タロットで占う恋愛 — 相手の気持ちを読み解くヒント"
      description={metadata.description}
      slug="tarot-love-reading"
    >
      <p>
        タロット占いの中でも、とりわけ人気が高いのが<strong>恋愛</strong>です。
        「相手は今どう思っている？」「この関係はどうなる？」——
        言葉にしづらい気持ちを、カードは象徴で映し出してくれます。
      </p>

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>タロットで恋愛を占ってみたい方</li>
          <li>結果に一喜一憂してしまう方</li>
          <li>占いとの向き合い方を整えたい方</li>
        </ul>
      </div>

      <h2>恋愛でよく登場するカード</h2>
      <ul className="space-y-2 !mt-2">
        {LOVE_CARDS.map(([name, mean, desc]) => (
          <li key={name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{name}</span>
            <span className="ml-2 text-xs text-indigo-300">{mean}</span>
            <p className="mt-1 text-sm text-slate-300">{desc}</p>
          </li>
        ))}
      </ul>

      <h2>結果との上手な向き合い方</h2>
      <p>
        恋愛タロットで大切なのは、結果に一喜一憂しすぎないことです。
        タロットは<strong>「今この瞬間の傾向」</strong>を映す鏡であって、確定した未来ではありません。
        望まない結果が出ても、それは「今の流れ」への気づき。
        <strong>同じ質問を何度も繰り返さない</strong>のも、タロットと付き合う基本のマナーです。
      </p>

      <h2>同じ質問をくり返してしまうとき</h2>
      <p>
        納得のいく答えが出るまで何度も引き直してしまう——
        これは初心者に限らず、とてもよく起こることです。
        実際、同じ質問をくり返しているときほど読みにくい結果が出やすい、
        と多くの占い手が指摘しています。
      </p>
      <p>
        引き直したくなったときは、質問そのものがずれている可能性があります。
        本当に知りたいのは相手の気持ちではなく、
        「この先も期待し続けていいのかどうか」だった、というケースは少なくありません。
        引く前に「本当は何を知りたいのか」を一度書き出すだけで、結果の受け取り方は大きく変わります。
      </p>

      <h2>結果に振り回されないための3つの約束</h2>
      <p>
        恋愛の占いは、どうしても感情が動きます。引く前にこの3つを決めておくと、結果に飲み込まれにくくなります。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">約束</th><th className="px-3 py-2 text-left">理由</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">1日1回までにする</td><td className="px-3 py-2">引くほど混乱し、判断が鈍ります</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">引く前に「受け止める」と決める</td><td className="px-3 py-2">都合のいい解釈を防げます</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">結果を相手に伝えない</td><td className="px-3 py-2">占いで相手を縛ることになりかねません</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 特に3つ目は大切です。占いは自分の整理のために使い、相手を動かす道具にはしないほうが安全です。</p>

      <h2>恋愛で出やすいカードと、その読み方</h2>
      <p>
        恋愛を占っていると、特定のカードが繰り返し出ることがあります。よく出るカードほど誤解されやすいので、代表的なものを整理しておきます。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">カード</th><th className="px-3 py-2 text-left">誤解されやすい読み方</th><th className="px-3 py-2 text-left">実際に近い読み方</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">恋人</td><td className="px-3 py-2">両想いで確定</td><td className="px-3 py-2">選択を迫られている場面</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">塔</td><td className="px-3 py-2">関係が壊れる</td><td className="px-3 py-2">前提が崩れて、本質が見えてくる</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">死神</td><td className="px-3 py-2">終わり、別れ</td><td className="px-3 py-2">形を変える時期、区切り</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">月</td><td className="px-3 py-2">不安、嘘</td><td className="px-3 py-2">まだ見えていない部分がある</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">星</td><td className="px-3 py-2">希望が叶う</td><td className="px-3 py-2">長い目で見れば良い方向</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 強そうな絵柄のカードほど、実際の意味は穏やかなことが多いものです。</p>
      <h2></h2>
      <p>
        大切なのは、1枚のカードで関係の是非を決めないことです。カードが示すのは「今の空気」であって、二人の結末ではありません。気になるカードが出たときは、そのカードが何を促しているかに目を向けてみてください。
      </p>



      <h2>よくある質問</h2>
      <h3>Q. 悪いカードが出たら諦めるべき？</h3>
      <p>
        カード1枚で関係が決まることはありません。「今のやり方では届きにくい」という意味であって、「この人とは無理」という意味ではないからです。変えられるのは相手ではなく、自分の関わり方のほうです。
      </p>
      <h3>Q. 同じカードが何度も出るのはなぜ？</h3>
      <p>
        まだそのテーマを通り過ぎていない、という見方をします。同じカードが続くときは、答えを探すより、そのカードが指している課題に一度向き合ったほうが早いことが多いです。
      </p>
      <h3>Q. 友人の恋愛を占ってもいい？</h3>
      <p>
        本人の同意があればかまいませんが、結果をそのまま伝えるのは避けたほうが無難です。占いは伝え方しだいで人を縛ってしまうことがあります。「こういう見方もあるみたい」くらいの温度で渡すのがおすすめです。
      </p>

      <h2>ホシドタロが気をつけていること</h2>
      <p>
        当サービスの鑑定文では、恋愛について断定的な予言をしません。「必ず結ばれます」「この人はやめたほうがいい」といった書き方は避けています。関係は生きものなので、外から決めつけられるものではないと考えているからです。そのかわり、今できることを一つ具体的にお伝えするようにしています。
      </p>


      <h2>まとめ</h2>
      <p>
        恋愛タロットは、相手の気持ちを決めつける道具ではなく、
        自分の心を整理し、次の一歩を考えるためのヒントです。
        カードが指し示す方向を参考に、あなたらしい選択をしてみてください。
      </p>
    </GuideArticle>
  );
}
