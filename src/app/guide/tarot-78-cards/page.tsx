// src/app/guide/tarot-78-cards/page.tsx
// タロットカード78枚 一覧 — サイト自身のJAデータから生成する大型リファレンス記事。
// 独自性・情報量・内部リンク(実際の占い機能への導線)を兼ねる。

import GuideArticle from '@/components/GuideArticle';
import tarotJa from '@/data/tarot-ja-index';

export const metadata = {
  title: 'タロットカード78枚 一覧 — 大アルカナ・小アルカナの意味まとめ',
  description:
    '大アルカナ22枚、小アルカナ56枚（ワンド・カップ・ソード・ペンタクル）、全78枚の正位置・逆位置の意味を一覧でまとめました。占いの前後にカードの意味を調べたいときの辞書としてご活用ください。',
};

const ORDER = {
  major: Array.from({ length: 22 }, (_, i) => `ar${String(i).padStart(2, '0')}`),
  wa: ['waac', 'wa02', 'wa03', 'wa04', 'wa05', 'wa06', 'wa07', 'wa08', 'wa09', 'wa10', 'wapa', 'wakn', 'waqu', 'waki'],
  cu: ['cuac', 'cu02', 'cu03', 'cu04', 'cu05', 'cu06', 'cu07', 'cu08', 'cu09', 'cu10', 'cupa', 'cukn', 'cuqu', 'cuki'],
  sw: ['swac', 'sw02', 'sw03', 'sw04', 'sw05', 'sw06', 'sw07', 'sw08', 'sw09', 'sw10', 'swpa', 'swkn', 'swqu', 'swki'],
  pe: ['peac', 'pe02', 'pe03', 'pe04', 'pe05', 'pe06', 'pe07', 'pe08', 'pe09', 'pe10', 'pepa', 'pekn', 'pequ', 'peki'],
};

function CardRow({ k }: { k: string }) {
  const c = tarotJa[k];
  if (!c) return null;
  return (
    <li className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <span className="font-semibold text-white">{c.name_ja}</span>
      <p className="mt-1 text-sm text-slate-300">
        <span className="text-indigo-300">正位置</span> {c.upright_ja}
      </p>
      <p className="mt-1 text-sm text-slate-400">
        <span className="text-slate-500">逆位置</span> {c.reversed_ja}
      </p>
    </li>
  );
}

function Suit({ title, keys }: { title: string; keys: string[] }) {
  return (
    <>
      <h2>{title}</h2>
      <ul className="space-y-2 !mt-2">
        {keys.map((k) => <CardRow key={k} k={k} />)}
      </ul>
    </>
  );
}

export default function Tarot78CardsPage() {
  return (
    <GuideArticle
      category="タロット / リファレンス"
      title="タロットカード78枚 一覧 — 大アルカナ・小アルカナの意味まとめ"
      description={metadata.description}
      slug="tarot-78-cards"
    >
      <p>
        タロットは<strong>大アルカナ22枚・小アルカナ56枚</strong>の全78枚で構成されています。
        小アルカナはさらに<strong>ワンド・カップ・ソード・ペンタクル</strong>の4スートに分かれ、
        それぞれ14枚（エース〜10、ペイジ・ナイト・クイーン・キング）ずつあります。
      </p>

      <div className="my-6 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
        <p className="mb-2 text-[13px] font-medium text-[#F5E6A8]">こんな方に向けた記事です</p>
        <ul className="ml-4 list-disc space-y-1 text-[13px] leading-relaxed text-[#B8B4D9]">
          <li>タロットカードの意味を調べたい方</li>
          <li>大アルカナと小アルカナの違いを知りたい方</li>
          <li>手元に置ける一覧がほしい方</li>
        </ul>
      </div>
      <p>
        このページでは全78枚の<strong>正位置・逆位置</strong>の意味を一覧にまとめました。
        当サイトの「今日の運勢」「する・しない」で実際に使われている解釈と同じものです。
        引いたカードの意味をあとから調べたいとき、あるいは占う前にどんなカードがあるか
        眺めてみたいときの辞書としてお使いください。
      </p>

      <Suit title="大アルカナ（22枚）" keys={ORDER.major} />
      <Suit title="ワンド（14枚）— 情熱・行動・仕事" keys={ORDER.wa} />
      <Suit title="カップ（14枚）— 感情・恋愛・人間関係" keys={ORDER.cu} />
      <Suit title="ソード（14枚）— 思考・葛藤・決断" keys={ORDER.sw} />
      <Suit title="ペンタクル（14枚）— 金運・現実・仕事の成果" keys={ORDER.pe} />

      <h2>小アルカナ4スートの見分け方</h2>
      <p>
        小アルカナ56枚は、4つのスート（組）に分かれています。それぞれが扱うテーマを覚えておくと、1枚ずつの意味を知らなくても、おおよその方向がつかめます。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">スート</th><th className="px-3 py-2 text-left">対応する要素</th><th className="px-3 py-2 text-left">扱うテーマ</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">ワンド（棒）</td><td className="px-3 py-2">火</td><td className="px-3 py-2">情熱、行動、仕事の勢い</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">カップ（聖杯）</td><td className="px-3 py-2">水</td><td className="px-3 py-2">感情、恋愛、人間関係</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">ソード（剣）</td><td className="px-3 py-2">風</td><td className="px-3 py-2">思考、言葉、対立や決断</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">ペンタクル（金貨）</td><td className="px-3 py-2">地</td><td className="px-3 py-2">お金、健康、現実的な成果</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ 数字も手がかりになります。1は始まり、10は完成、コートカード（人物札）は関わる人を表します。</p>

      <h2>数字が持つ意味を知ると一気に読める</h2>
      <p>
        小アルカナ56枚を1枚ずつ覚えるのは現実的ではありません。そこで役に立つのが数字です。スート（棒・杯・剣・金貨）が「分野」を、数字が「進み具合」を表すと考えると、知らないカードでもおおよその見当がつきます。
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[#F5E6A8]"><tr><th className="px-3 py-2 text-left">数字</th><th className="px-3 py-2 text-left">意味するところ</th><th className="px-3 py-2 text-left">読み方の例</th></tr></thead>
          <tbody className="text-[#B8B4D9]"><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">1（エース）</td><td className="px-3 py-2">始まり、種</td><td className="px-3 py-2">これから何かが動き出す</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">2〜3</td><td className="px-3 py-2">芽が出る、形になる</td><td className="px-3 py-2">協力者が現れる、少し前進</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">4〜6</td><td className="px-3 py-2">安定と停滞</td><td className="px-3 py-2">守りに入る、現状維持</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">7〜9</td><td className="px-3 py-2">試練と成熟</td><td className="px-3 py-2">踏ん張りどころ、山場</td></tr><tr className="border-t border-[#3A3C6B]"><td className="px-3 py-2">10</td><td className="px-3 py-2">完成、次への引き継ぎ</td><td className="px-3 py-2">一区切りがつく</td></tr></tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-[#8B8DBC]">※ たとえば「金貨の10」なら、お金や生活の面で一つの区切りがつく、と読めます。</p>
      <h2></h2>
      <p>
        コートカード（ペイジ・ナイト・クイーン・キング）は、関わる人物や、そのときの自分の役回りを表します。ペイジは学ぶ立場、ナイトは動く立場、クイーンは受け止める立場、キングは決める立場、と覚えておくと迷いません。
      </p>



      <h2>よくある質問</h2>
      <h3>Q. 大アルカナと小アルカナ、どちらから覚える？</h3>
      <p>
        大アルカナ22枚からで問題ありません。人生の大きなテーマを表すカードなので、まずここを押さえると全体の骨組みが見えます。小アルカナは日常の細かい出来事を表すので、あとから足していけば十分です。
      </p>
      <h3>Q. 同じカードでも本によって意味が違うのはなぜ？</h3>
      <p>
        タロットには一つの正解がないためです。デッキの絵柄や、書き手が重んじる流派によって解釈は変わります。複数の意味を見比べて、自分がしっくりくるものを選んで構いません。
      </p>
      <h3>Q. 意味を忘れてしまったときは？</h3>
      <p>
        その場で絵を見て感じたことを優先してかまいません。意味を思い出せないカードほど、絵から受け取る印象が素直に働きます。あとから調べて答え合わせをすると、記憶にも残りやすくなります。
      </p>

      <h2>ホシドタロのカード図鑑</h2>
      <p>
        当サービスには「カードコレクション」があり、これまで引いたカードが図鑑のように貯まっていきます。意味を眺めるだけより、実際に引いたカードとして出会うほうが記憶に残ります。収集率も表示されるので、少しずつ埋めていく楽しみ方もできます。
      </p>


      <h2>まとめ</h2>
      <p>
        78枚それぞれに正位置・逆位置の意味がありますが、覚える必要はありません。
        気になったときにこのページで調べる、あるいは当サイトの占いでカードが出た瞬間に
        意味を確認する——それくらい気軽な付き合い方で十分です。
      </p>
    </GuideArticle>
  );
}
