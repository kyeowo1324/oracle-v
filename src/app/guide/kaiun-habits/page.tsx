// src/app/guide/kaiun-habits/page.tsx
// 【下書き⑧】毎日できる開運習慣
// ⚠️ 公開前に体験を1〜2段落追加。
// 根拠: 風水・開運の一般的通説(玄関・掃除・朝の習慣など)。

import GuideArticle from '@/components/GuideArticle';

export const metadata = {
  title: '毎日できる開運習慣 — 今日から始める運気アップの小さな工夫',
  description:
    '玄関の掃除、朝のひと工夫、感謝の習慣など、日常に無理なく取り入れられる開運アクションを紹介。運気を味方につける小さな習慣をまとめました。',
};

const HABITS = [
  ['玄関をきれいに保つ', '玄関は良い気も悪い気も入る大切な場所。靴を出しっぱなしにせず、明るく整えておくと全体運の底上げにつながるとされます。'],
  ['朝、窓を開けて空気を入れ替える', '新しい気を取り込む基本の習慣。短時間でも空気を動かすことで、気持ちの切り替えにも効果的です。'],
  ['財布の中を整理する', 'レシートやカードを溜め込まず、お金が「ゆったり過ごせる」状態に。金運を意識するなら日々の小さな整頓から。'],
  ['ラッキーカラーを一つ身につける', '毎日の服や小物にその日の幸運の色を一点。「今日はこれで大丈夫」という安心感が行動を後押しします。'],
  ['感謝を言葉にする', '周囲への「ありがとう」を口に出すと、人との縁が円滑に。対人運を整える最もシンプルな開運アクションです。'],
];

export default function KaiunHabitsPage() {
  return (
    <GuideArticle
      category="基礎 / 開運"
      title="毎日できる開運習慣 — 今日から始める運気アップの小さな工夫"
      description={metadata.description}
      slug="kaiun-habits"
    >
      <p>
        開運というと大がかりなことを想像しがちですが、実は
        <strong>毎日の小さな習慣</strong>の積み重ねが運気を整えると言われます。
        ここでは、今日から無理なく始められる開運アクションを紹介します。
      </p>

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>開運習慣を始めたいけれど続かない方</li>
          <li>何から手をつければいいか迷っている方</li>
          <li>大がかりなことはしたくない方</li>
        </ul>
      </div>

      <h2>今日から始める5つの習慣</h2>
      <ul className="space-y-2 !mt-2">
        {HABITS.map(([name, desc]) => (
          <li key={name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <span className="font-semibold text-white">{name}</span>
            <p className="mt-1 text-sm text-slate-300">{desc}</p>
          </li>
        ))}
      </ul>

      <h2>続けるコツは「一つだけ」</h2>
      <p>
        全部を完璧にやろうとすると続きません。まずは<strong>ピンときた一つ</strong>だけ選び、
        歯磨きのように生活へ溶け込ませるのがコツです。習慣が身につくと、
        運気うんぬん以前に、暮らしそのものが少し整い、気分よく過ごせるようになります。
      </p>

      <h2>続かない人と続く人の分かれ目</h2>
      <p>
        開運習慣がうまくいかなかった理由として最も多く挙がるのが、
        「一度にいくつも始めてしまった」というものです。
        逆に長く続いている人の話を聞くと、やっていることは驚くほど小さく、
        玄関の靴をそろえる、朝に窓を開ける、といった数十秒で終わることがほとんどです。
      </p>
      <p>
        そして続けた人が先に実感するのは、運が良くなったかどうかではなく、
        気分の変化のほうだと言われます。運気そのものは目に見えませんが、
        出かける瞬間の気持ちは自分でわかります。まずはそこからで十分だと、当サービスでは考えています。
      </p>

      <h2>続いた人がやっている「小さすぎる習慣」</h2>
      <p>
        開運習慣が続かない最大の理由は、始めた習慣が大きすぎることです。実際に長続きしている人の習慣を並べてみると、驚くほど小さいものばかりです。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">習慣</th><th className="px-3 py-2 text-left">かかる時間</th><th className="px-3 py-2 text-left">続きやすさ</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">玄関の靴をそろえる</td><td className="px-3 py-2">10秒</td><td className="px-3 py-2">★★★★★</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">朝に窓を10cm開ける</td><td className="px-3 py-2">5秒</td><td className="px-3 py-2">★★★★★</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">財布のレシートを捨てる</td><td className="px-3 py-2">30秒</td><td className="px-3 py-2">★★★★</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">毎朝の掃除機がけ</td><td className="px-3 py-2">10分</td><td className="px-3 py-2">★★</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">毎日の写経</td><td className="px-3 py-2">30分</td><td className="px-3 py-2">★</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 迷ったら「歯みがきのついでにできるか」を基準にしてみてください。</p>

      <h2>朝・昼・夜、時間帯ごとにできること</h2>
      <p>
        開運習慣は「いつやるか」を決めておくと定着します。すでにある行動にくっつけるのがコツで、新しく時間を作ろうとすると、たいてい三日で終わります。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">時間帯</th><th className="px-3 py-2 text-left">くっつける行動</th><th className="px-3 py-2 text-left">やること</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">朝</td><td className="px-3 py-2">歯みがきのあと</td><td className="px-3 py-2">窓を10cm開けて空気を入れ替える</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">朝</td><td className="px-3 py-2">家を出る直前</td><td className="px-3 py-2">玄関の靴をそろえる</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">昼</td><td className="px-3 py-2">昼食のあと</td><td className="px-3 py-2">財布のレシートを1枚捨てる</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">夜</td><td className="px-3 py-2">お風呂のあと</td><td className="px-3 py-2">机の上を1か所だけ片づける</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">夜</td><td className="px-3 py-2">寝る前</td><td className="px-3 py-2">明日やることを1つだけ書く</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 全部やる必要はありません。この中から一つだけ選んでください。</p>
      <h2></h2>
      <p>
        続けるうえでいちばん大事なのは、抜けた日を責めないことです。「毎日やらないと意味がない」と考えるほど、一度抜けたときにやめてしまいます。週に4日できれば十分。そのくらいの気楽さのほうが、結果的に長く続きます。
      </p>



      <h2>よくある質問</h2>
      <h3>Q. 何個くらい始めるのがいいですか？</h3>
      <p>
        1つだけです。うまくいかなかった人の話でいちばん多いのが「同時にいくつも始めた」というもの。逆に長く続いている人の習慣は、玄関の靴をそろえる、朝に窓を開けるなど、30秒で終わることがほとんどです。
      </p>
      <h3>Q. 効果はどのくらいで出ますか？</h3>
      <p>
        運気そのものは目に見えないので、正直はっきりとは言えません。ただ、続けた人が先に実感するのは気分の変化のほうです。家を出る瞬間が少し軽い、といった小さな変化から始まることが多いようです。
      </p>
      <h3>Q. 忘れてしまう日があってもいい？</h3>
      <p>
        大丈夫です。むしろ「毎日やらないと意味がない」と考えるほうが続きません。週に4日できれば十分。抜けた日を責めないことが、続けるいちばんのコツです。
      </p>

      <h2>ホシドタロでできること</h2>
      <p>
        当サービスには「今日のラッキーアイテム」と「開運日カレンダー」があります。ラッキーアイテムは毎日変わるので、今日一日の小さな目印として。開運日カレンダーは、一粒万倍日や天赦日といった暦の吉日をまとめてあるので、「何かを始める日」を決めるときの目安に使えます。どちらも登録なしで見られます。
      </p>


      <h2>まとめ</h2>
      <p>
        開運習慣の本質は、日々を丁寧に過ごすこと。小さな行動が積もって、
        「なんだか最近いい流れ」を作っていきます。今日の運勢と合わせて、
        あなたに合う習慣を一つ、始めてみてください。
      </p>
    </GuideArticle>
  );
}
