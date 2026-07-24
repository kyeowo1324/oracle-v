// src/data/guides.ts
// 가이드 글 목록의 단일 출처(single source of truth).
//
// 전에는 이 목록이 src/app/guide/page.tsx 안에 있었다. 그러면 공통 컴포넌트
// (GuideArticle)가 목록을 읽으려 할 때 "페이지가 컴포넌트를, 컴포넌트가 페이지를"
// 서로 참조하는 위험한 구조가 된다. 그래서 데이터만 따로 떼어냈다.
//
// 새 글을 추가할 때는 이 파일에 한 줄만 넣으면
//   목록 페이지 / 사이트맵 / 관련글 추천 / 카테고리 분류
// 네 곳에 전부 자동 반영된다.

export type GuideMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: boolean;
};

export const GUIDE_ARTICLES: readonly GuideMeta[] = [
{ slug: 'what-is-uranai', title: '占いとの上手な付き合い方 — 当てるより「活かす」', excerpt: '星座・タロット・血液型などをどう受け止め、日常のヒントとして活かすかを考えます。', category: '基礎', published: true },
  { slug: 'astrology-basics', title: '星座占いの基本 — 12星座の性格と運勢の読み方', excerpt: '12星座それぞれの性格傾向と、日々の運勢をどう読み解くかを丁寧に解説します。', category: '星座', published: true },
  { slug: 'zodiac-compatibility', title: '12星座の相性 — エレメントで見る恋愛・友情の傾向', excerpt: '火・地・風・水の4エレメントから、星座の相性の傾向をやさしく解説します。', category: '星座', published: true },
  { slug: 'zodiac-2026-late-trends', title: '星座別 2026年下半期の傾向 — 4エレメントで見る過ごし方のヒント', excerpt: '2026年下半期を、火・地・風・水の4エレメントごとの傾向でやさしく整理しました。', category: '星座', published: true },
  { slug: 'aisho-zodiac-ranking', title: '相性のいい星座ランキング — 恋愛・友情・仕事で見る好相性ペア', excerpt: '12星座の相性が良い組み合わせをランキングで。シーン別に理由もあわせて解説します。', category: '星座', published: true },
  { slug: 'tarot-basics', title: 'タロット占いの基本 — 大アルカナと正位置・逆位置の読み方', excerpt: '大アルカナ22枚の意味と、初心者向けの1枚引き（ワンオラクル）のやり方を解説。', category: 'タロット', published: true },
  { slug: 'tarot-three-card-spread', title: 'タロット3枚引きの読み方 — 過去・現在・未来スプレッド', excerpt: '初心者でも扱いやすい3枚スプレッドの手順と、カードをつなげて読むコツ。', category: 'タロット', published: true },
  { slug: 'renai-tarot-spread', title: '恋愛タロットの引き方 — 質問の立て方とおすすめスプレッド3選', excerpt: '恋愛を占うときの質問の立て方と、相手の気持ち・二人の未来・片思いに向く3つのスプレッド。', category: 'タロット', published: true },
  { slug: 'gyakui-no-yomikata', title: '逆位置が出たときの読み方 — 怖くない、むしろヒントが増える', excerpt: '逆位置の4つの読み方パターンと、悪い意味に引きずられないためのコツ。', category: 'タロット', published: true },
  { slug: 'tarot-seiza-kumiawase', title: 'タロットと星座の組み合わせ方 — 2つの占いを重ねて読むコツ', excerpt: '大アルカナと12星座の対応表つき。2つの占いを重ねて読む実践的な方法。', category: 'タロット', published: true },
  { slug: 'tarot-love-reading', title: 'タロットで占う恋愛 — 相手の気持ちを読み解くヒント', excerpt: '恋愛でよく登場するカードの意味と、結果との向き合い方を紹介します。', category: 'タロット', published: true },
  { slug: 'tarot-78-cards', title: 'タロットカード78枚 一覧 — 大アルカナ・小アルカナの意味まとめ', excerpt: '全78枚の正位置・逆位置の意味を一覧化。占いの前後に調べられる辞書代わりに。', category: 'タロット', published: true },
  { slug: 'blood-type-personality', title: '血液型でわかる性格の傾向 — A・B・O・AB型の特徴', excerpt: '各血液型に語られる性格イメージと相性を、文化的背景とともに紹介します。', category: '血液型', published: true },
  { slug: 'how-to-read-daily-fortune', title: '今日の運勢の見方 — 総合運・恋愛運・金運・仕事運', excerpt: '4カテゴリの運勢をどう受け止め、日常にどう活かすかをまとめました。', category: '基礎', published: true },
  { slug: 'lucky-color-number', title: 'ラッキーカラー・ラッキーナンバーの活用法【2026年】', excerpt: '2026年のラッキーカラーと、日常への無理のない取り入れ方を紹介します。', category: '基礎', published: true },
  { slug: 'kaiun-habits', title: '毎日できる開運習慣 — 今日から始める運気アップの小さな工夫', excerpt: '玄関の掃除、朝のひと工夫など、無理なく続けられる開運アクション。', category: '基礎', published: true },
  { slug: 'omikuji-culture', title: 'おみくじと日本の占い文化 — 大吉・凶の意味と歴史', excerpt: '初詣で引くおみくじの由来や、日本人が古くから占いと付き合ってきた文化的背景を解説。', category: '基礎', published: true },
  { slug: 'asa-uranai-shukan', title: '朝の占い習慣のすすめ — 1日3分で気分を整えるルーティン', excerpt: '朝占いのメリットと、結果に振り回されずに活かすコツ。続けやすい3分ルーティン。', category: '習慣', published: true },
  { slug: 'moon-uranai', title: '満月・新月と運勢 — 月のリズムで整える開運習慣', excerpt: '新月は始まり、満月は手放し。月の満ち欠けと運勢の関係、新月の願い事のやり方。', category: '習慣', published: true },
  { slug: 'yume-uranai-nyumon', title: '夢占い入門 — よく見る夢のシンボル15と読み解きのコツ', excerpt: '追いかけられる夢、歯が抜ける夢…よく見る夢の意味15個と、夢を記録するコツ。', category: '夢占い', published: true },
] as const;

/** 목록에 보여줄 카테고리 순서. 여기에 없는 카테고리는 뒤에 자동으로 붙는다. */
export const CATEGORY_ORDER = ['基礎', '星座', 'タロット', '血液型', '習慣', '夢占い'] as const;

export const publishedGuides = (): GuideMeta[] =>
  GUIDE_ARTICLES.filter((a) => a.published);
