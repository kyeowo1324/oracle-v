// src/app/guide/aisho-zodiac-ranking/page.tsx
import GuideArticle from '@/components/GuideArticle';

export const metadata = {
  title: '相性のいい星座ランキング — 恋愛・友情・仕事で見る好相性ペア',
  description:
    '12星座の相性が良い組み合わせをランキング形式で紹介。恋愛・友情・仕事のシーン別に、なぜ相性が良いのかの理由もあわせて解説します。',
};

const PAIRS: { rank: string; pair: string; why: string }[] = [
  { rank: '第1位', pair: '獅子座 × 射手座', why: '火×火の情熱コンビ。互いの挑戦を心から応援し合え、一緒にいるだけで行動力が倍増します。' },
  { rank: '第2位', pair: '牡牛座 × 山羊座', why: '地×地の堅実ペア。価値観と金銭感覚が近く、長期的な信頼を静かに積み上げていける関係。' },
  { rank: '第3位', pair: '双子座 × 天秤座', why: '風×風の会話上手コンビ。話題が尽きず、ほどよい距離感を保てるので疲れない関係が続きます。' },
  { rank: '第4位', pair: '蟹座 × 魚座', why: '水×水の共感ペア。言葉にしなくても気持ちが通じ合い、弱さを見せ合える安心感があります。' },
  { rank: '第5位', pair: '牡羊座 × 水瓶座', why: '火×風の刺激コンビ。牡羊座の勢いに水瓶座の独創性が加わり、新しいことを始める最強タッグに。' },
];

export default function AishoZodiacRankingPage() {
  return (
    <GuideArticle
      category="星座 / 相性"
      title="相性のいい星座ランキング — 恋愛・友情・仕事で見る好相性ペア"
      description={metadata.description}
      slug="aisho-zodiac-ranking"
    >
      <p>
        「あの人と星座の相性はいいのかな？」——星座の相性は、恋愛でも友情でも
        つい調べたくなる定番テーマです。この記事では、エレメント
        （火・地・風・水）の考え方をベースに、<strong>好相性の組み合わせを
        ランキング形式</strong>で紹介します。もちろん相性は絶対ではなく
        「傾向」ですが、相手を理解するヒントとして楽しんでください。
      </p>

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>自分と相性のいい星座を知りたい方</li>
          <li>ランキング下位の相手と関わっている方</li>
          <li>恋愛・友情・仕事で相性の違いを知りたい方</li>
        </ul>
      </div>

      <h2>相性の基本ルール — エレメントで見る</h2>
      <p>
        12星座は4つのエレメントに3つずつ分かれます。
        火（牡羊・獅子・射手）、地（牡牛・乙女・山羊）、
        風（双子・天秤・水瓶）、水（蟹・蠍・魚）。
        基本ルールはシンプルで、<strong>同じエレメント同士は価値観が近く、
        火×風、地×水は互いを活かし合う</strong>とされます。
        逆に火×水、風×地はテンポの違いから、理解に少し時間がかかる組み合わせです。
      </p>

      <h2>総合・好相性ランキング BEST5</h2>
      <ul className="space-y-2 !mt-2">
        {PAIRS.map((p) => (
          <li key={p.rank} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{p.rank}：{p.pair}</span>
            <p className="mt-1 text-sm text-slate-300">{p.why}</p>
          </li>
        ))}
      </ul>

      <h2>シーン別に見ると順位が変わる</h2>
      <p>
        <strong>恋愛なら</strong>、ときめきを重視するなら正反対の組み合わせ
        （牡羊座×天秤座、牡牛座×蠍座など、星座の輪でちょうど向かい合うペア）も
        実は人気です。違いが刺激になり、「自分にないもの」に惹かれ合います。
      </p>
      <p>
        <strong>友情なら</strong>、同じエレメント同士が最強です。
        テンションとノリが合うので、久しぶりに会っても一瞬で距離が縮まります。
      </p>
      <p>
        <strong>仕事なら</strong>、あえて違うエレメントを組むのが吉。
        火のスピード×地の堅実さ、風のアイデア×水の共感力のように、
        弱点を補い合うチームは強い。「合わない」と感じる相手ほど、
        仕事では最高の相棒になる可能性があります。
      </p>

      <h2>相性が「悪い」とされる相手とは？</h2>
      <p>
        相性表で低めに出る組み合わせは、「ダメ」ではなく
        <strong>「翻訳が必要な関係」</strong>だと考えてください。
        たとえば火×水は、火のストレートさが水には強すぎ、
        水の察してほしい気持ちが火には見えにくい。
        でも「この人は言葉より態度で示すタイプなんだ」と翻訳できれば、
        誰よりも深い信頼関係になれます。相性占いの本当の使い道は、
        この「翻訳のコツ」を知ることにあります。
      </p>

      <h2>ランキングは「探す表」ではなく「知る表」</h2>
      <p>
        相性ランキングを見て気になるのは、たいてい上位より下位のほうです。
        ただ実際には、下位とされる組み合わせで長く続いている関係もたくさんあります。
        違いが最初からはっきりしているぶん、
        期待のかけ方を間違えずに済んだ、という話がよく聞かれます。
      </p>
      <p>
        反対に、上位の相手だからといって何もしなくてよいわけでもありません。
        似ている者同士は、同じところでつまずきやすいという面もあります。
        ランキングは「合う相手を探す表」というより、
        「この人とはここが違う」と早めに知るための表として使うのがおすすめです。
      </p>

      <h2>シーン別・相性の見方が変わる理由</h2>
      <p>
        同じ組み合わせでも、恋愛と仕事では評価が逆転することがあります。これは求めるものが違うためです。恋愛では「似ていること」が安心につながりますが、仕事では「違うこと」が穴を埋め合う強みになります。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">シーン</th><th className="px-3 py-2 text-left">相性が良いとされる関係</th><th className="px-3 py-2 text-left">理由</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">恋愛</td><td className="px-3 py-2">同じエレメント</td><td className="px-3 py-2">感覚が近く、説明が要らない</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">友情</td><td className="px-3 py-2">火と風 / 地と水</td><td className="px-3 py-2">テンポが合い、飽きにくい</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">仕事</td><td className="px-3 py-2">違うエレメント</td><td className="px-3 py-2">得意分野が重ならず、補い合える</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">家族</td><td className="px-3 py-2">地を含む組み合わせ</td><td className="px-3 py-2">生活の土台を作りやすい</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ ランキング下位でも、役割が分かれていればうまくいくことは珍しくありません。</p>


      <h2>よくある質問</h2>
      <h3>Q. ランキングは絶対ですか？</h3>
      <p>
        絶対ではありません。エレメント（火・地・風・水）の関係から見た大まかな傾向にすぎません。実際の関係は、会った時期、置かれた立場、お互いの成熟度でいくらでも変わります。
      </p>
      <h3>Q. 恋愛と仕事で相性は違いますか？</h3>
      <p>
        違います。恋愛では似ている相手が安心につながりますが、仕事では違うタイプのほうが穴を埋め合えることが多いものです。「合わない」と感じる相手が、仕事では最高の相棒になることもあります。
      </p>
      <h3>Q. 下位の相手とうまくやるコツは？</h3>
      <p>
        相手に期待する内容を変えることです。早く決めてほしい相手なのか、じっくり考えたい相手なのか。そこを最初に見極めておくと、待つべき場面で急かさずに済みます。
      </p>

      <h2>ホシドタロで確かめる</h2>
      <p>
        当サービスの「相性占い」では、二人の情報を入れると相性度が出るだけでなく、「どこが噛み合い、どこがずれやすいか」を具体的にお伝えします。結果画面の下には、あなたと相性の良い星座トップ3も表示されるので、ランキングを見たあとの答え合わせにも使えます。
      </p>


      <h2>まとめ</h2>
      <p>
        相性は運命の判定ではなく、相手を理解するための地図です。
        気になる人との組み合わせをチェックしたら、
        <a href="/flow?mode=fortune">今日の運勢</a>で対人運も
        あわせて見てみてください。もっと詳しいエレメントの解説は
        <a href="/guide/zodiac-compatibility">12星座の相性 — エレメント編</a>もどうぞ。
      </p>
    </GuideArticle>
  );
}
