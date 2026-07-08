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

      <h2>まとめ</h2>
      <p>
        78枚それぞれに正位置・逆位置の意味がありますが、覚える必要はありません。
        気になったときにこのページで調べる、あるいは当サイトの占いでカードが出た瞬間に
        意味を確認する——それくらい気軽な付き合い方で十分です。
      </p>
    </GuideArticle>
  );
}
