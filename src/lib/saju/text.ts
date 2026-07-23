// src/lib/saju/text.ts
// 四柱推命 표시용 일본어 텍스트. 정적 상수라 DB 왕복 없이 즉시 렌더($0).
// 긴 해석문은 Supabase(saju_interpretations)에서 가져오고, 여기는 라벨·요약 담당.

import type { Element, TenGod } from './calc';

export const ELEMENT_JA: Record<Element, string> = {
  木: '木（もく）', 火: '火（か）', 土: '土（ど）', 金: '金（ごん）', 水: '水（すい）',
};
export const ELEMENT_COLOR: Record<Element, string> = {
  木: '#4FA871', 火: '#D9584E', 土: '#C9A227', 金: '#C9C4D4', 水: '#4E7FD9',
};
/** 용신 활용: 색·방위·계절 */
export const ELEMENT_LUCK: Record<Element, { color: string; dir: string; season: string; food: string }> = {
  木: { color: '緑・青緑', dir: '東', season: '春', food: '酸味・野菜' },
  火: { color: '赤・朱', dir: '南', season: '夏', food: '苦味・温かいもの' },
  土: { color: '黄・ベージュ', dir: '中央', season: '土用', food: '甘味・根菜' },
  金: { color: '白・シルバー', dir: '西', season: '秋', food: '辛味・乾物' },
  水: { color: '黒・紺', dir: '北', season: '冬', food: '塩味・海の幸' },
};

/** 일간 10종 — 캐릭터 요약 */
export const DAY_STEM_JA: { name: string; symbol: string; keyword: string; desc: string }[] = [
  { name: '甲（きのえ）', symbol: '大樹', keyword: 'まっすぐ・リーダー', desc: '天に向かって伸びる大木。芯が強く、曲がったことが嫌い。頼られると力を発揮します。' },
  { name: '乙（きのと）', symbol: '草花', keyword: 'しなやか・適応', desc: '風になびく草花。柔軟で人当たりがよく、どんな環境にも根を下ろせる強さがあります。' },
  { name: '丙（ひのえ）', symbol: '太陽', keyword: '明るい・華やか', desc: '誰も隠せない太陽。裏表がなく、その場をぱっと明るくする存在感があります。' },
  { name: '丁（ひのと）', symbol: '灯火', keyword: '繊細・あたたかい', desc: 'ろうそくの灯。細やかに人の心を照らし、そばにいる人をそっと温めます。' },
  { name: '戊（つちのえ）', symbol: '山', keyword: '安定・どっしり', desc: '動かない大きな山。信頼感があり、周囲の拠りどころになる包容力の持ち主。' },
  { name: '己（つちのと）', symbol: '田畑', keyword: '育てる・実務', desc: '作物を育てる田畑。地道で面倒見がよく、人や物事を育てるのが得意です。' },
  { name: '庚（かのえ）', symbol: '鋼', keyword: '決断・まっすぐ', desc: '鍛えられた金属。決断が早く、義理堅い。ここぞという場面で強さが出ます。' },
  { name: '辛（かのと）', symbol: '宝石', keyword: '繊細・美意識', desc: '磨かれた宝石。感性が鋭く美意識が高い。細部にこだわる完成度の高さが魅力。' },
  { name: '壬（みずのえ）', symbol: '大海', keyword: '自由・器が大きい', desc: '流れる大河。発想が自由で懐が深く、変化をおそれない大らかさがあります。' },
  { name: '癸（みずのと）', symbol: '雨露', keyword: '直感・静かな芯', desc: '静かに降る雨。直感が鋭く、内側に強い芯を持つ思慮深いタイプ。' },
];

/** 십신 10종 — 일본어 라벨과 의미 */
export const TEN_GOD_JA: Record<TenGod, { ja: string; keyword: string; desc: string }> = {
  比肩: { ja: '比肩（ひけん）', keyword: '自立・マイペース', desc: '自分の足で立つ力。独立心が強く、人に合わせるより自分の道を選びます。' },
  劫財: { ja: '劫財（ごうざい）', keyword: '勝負・社交', desc: '外に出て人と競い、つながる力。行動力がある反面、出費も増えやすい面が。' },
  食神: { ja: '食神（しょくじん）', keyword: '楽しむ・才能', desc: '衣食住に恵まれ、好きなことを自然体で表現できる才能。おおらかさが持ち味。' },
  傷官: { ja: '傷官（しょうかん）', keyword: '感性・こだわり', desc: '鋭い感性と表現力。既存のやり方に納得しないぶん、独創的な結果を出します。' },
  偏財: { ja: '偏財（へんざい）', keyword: '人脈・チャンス', desc: '動くお金と広い人脈。商才があり、流れをつかむのが上手いタイプ。' },
  正財: { ja: '正財（せいざい）', keyword: '堅実・積み上げ', desc: 'こつこつ貯める堅実さ。約束を守り、地に足のついた豊かさを築きます。' },
  偏官: { ja: '偏官（へんかん）', keyword: '行動・突破', desc: '困難を押し切る強い行動力。プレッシャーのある場面ほど本領を発揮します。' },
  正官: { ja: '正官（せいかん）', keyword: '責任・信頼', desc: 'ルールと責任を大切にする真面目さ。組織の中で信頼を得やすい資質。' },
  偏印: { ja: '偏印（へんいん）', keyword: 'ひらめき・探究', desc: '独特の着眼点と探究心。専門分野や、人と違う視点で光ります。' },
  正印: { ja: '正印（せいいん）', keyword: '学び・守られる', desc: '学びと知識、そして周囲に守られる縁。目上からの引き立てを受けやすい資質です。' },
};

/** 신강/신약 */
export const STRENGTH_JA = {
  strong: { label: '身強（みきょう）', desc: '自分の力が強いタイプ。エネルギーを外に出すほど流れが良くなります。' },
  weak: { label: '身弱（みじゃく）', desc: '周りの力を借りると伸びるタイプ。無理をせず、支えを得るのが吉。' },
  balanced: { label: '中和（ちゅうわ）', desc: 'バランスの取れたタイプ。状況に応じて柔軟に立ち回れます。' },
} as const;

/** 12지 일본어 */
export const BRANCH_JA: Record<string, string> = {
  子: '子（ね）', 丑: '丑（うし）', 寅: '寅（とら）', 卯: '卯（う）',
  辰: '辰（たつ）', 巳: '巳（み）', 午: '午（うま）', 未: '未（ひつじ）',
  申: '申（さる）', 酉: '酉（とり）', 戌: '戌（いぬ）', 亥: '亥（い）',
};

/** 기둥 라벨 */
export const PILLAR_JA = {
  year: { label: '年柱', meaning: '祖先・幼少期・家庭環境' },
  month: { label: '月柱', meaning: '青年期・仕事・社会性' },
  day: { label: '日柱', meaning: 'あなた自身・配偶者' },
  hour: { label: '時柱', meaning: '晩年・子ども・未来' },
} as const;
