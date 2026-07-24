// src/lib/saju/text.ts
// 四柱推命 표시용 일본어 텍스트. 정적 상수라 DB 왕복 없이 즉시 렌더($0).
// 긴 해석문은 Supabase(saju_interpretations)에서 가져오고, 여기는 라벨·요약 담당.

import type { Element, TenGod } from './calc';
import stemManifest from '@/data/saju-stem-manifest.json';

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

// ─────────────────────────────────────────────
// 테마(観点) — 재방문 설계의 핵심.
// 명식은 불변이지만 "무엇을 묻는가"는 바꿀 수 있다.
// 같은 사주를 6가지 관점으로 → 자연스럽게 6회 이용.
// 고정 선택지라 자유 입력이 없다 = 프롬프트 인젝션 위험 원천 차단.
// ─────────────────────────────────────────────

export type SajuTheme = 'total' | 'love' | 'work' | 'money' | 'health' | 'social';

export const SAJU_THEMES: { key: SajuTheme; label: string; emoji: string; hint: string; focus: string }[] = [
  { key: 'total', label: '総合運', emoji: '🀄', hint: '生まれ持った本質を総合的に', focus: '性格の本質、全体の流れ、人生のテーマ' },
  { key: 'love', label: '恋愛運', emoji: '💗', hint: '恋のかたちと相手の傾向', focus: '恋愛傾向、惹かれる相手、縁の育て方' },
  { key: 'work', label: '仕事運', emoji: '💼', hint: '向いている働き方と強み', focus: '適性、働き方、力を発揮できる環境' },
  { key: 'money', label: '金運', emoji: '💰', hint: 'お金との付き合い方', focus: '金銭感覚、貯め方と使い方、豊かさの育て方' },
  { key: 'health', label: '健康運', emoji: '🌿', hint: '体質と整え方のヒント', focus: '体質傾向、疲れやすい部分、養生のコツ' },
  { key: 'social', label: '人間関係', emoji: '🤝', hint: '人との距離のとり方', focus: '対人スタイル、相性の良い関係、距離感' },
];

export function resolveTheme(k: unknown): SajuTheme {
  const found = SAJU_THEMES.find((t) => t.key === k);
  return found ? found.key : 'total';
}

/** 십신별 오늘의 기운(일진 표시용). 길흉 단정이 아니라 "기운의 種類" */
export const DAY_LUCK_JA: Record<TenGod, { mood: string; advice: string }> = {
  比肩: { mood: '自分のペースを守る日', advice: '人に合わせすぎず、自分の判断で進めて大丈夫な一日。' },
  劫財: { mood: '人と動く日', advice: '外に出ると流れが生まれます。ただ出費は少し意識して。' },
  食神: { mood: 'のびのび過ごせる日', advice: '好きなことや美味しいものに素直に。力が抜けるほど巡ります。' },
  傷官: { mood: '感性が冴える日', advice: 'アイデアが湧く一方、言葉が鋭くなりがち。表現に回すと吉。' },
  偏財: { mood: 'ご縁とチャンスの日', advice: '人との接点が広がりやすい日。誘いには乗ってみて。' },
  正財: { mood: '積み上げが効く日', advice: '地道な作業や整理が実を結びます。派手さより着実さを。' },
  偏官: { mood: '負荷がかかりやすい日', advice: '無理は禁物。ひとつに絞って、休む時間も確保して。' },
  正官: { mood: 'きちんとが活きる日', advice: '約束や手続きごとに向く日。丁寧さがそのまま信頼に。' },
  偏印: { mood: '内に向かう日', advice: '調べもの、学び、ひとり時間が充実。急がなくて大丈夫。' },
  正印: { mood: '守られている日', advice: '目上や周囲の助けを受け取りやすい日。頼るのも実力です。' },
};

// ─────────────────────────────────────────────
// 이미지 에셋 매핑 (사용자가 제작해 넣을 예정)
// 파일이 없으면 자동으로 이모지 폴백 → 이미지 없이도 화면이 깨지지 않는다.
// ─────────────────────────────────────────────

// 일간 10종 이미지는 "있으면 쓰고 없으면 이모지"로 동작한다.
// 어떤 파일이 실제로 존재하는지는 빌드 시 scripts/generate-deck-manifest.mjs 가
// public/saju/stem/ 을 스캔해 saju-stem-manifest.json 에 기록한다.
//   → 이미지가 없으면 아예 <img>를 그리지 않으므로 404 요청도 발생하지 않는다.
//   → 나중에 파일만 넣고 배포하면 자동으로 이미지가 나타난다. 코드 수정 불필요.
const STEM_MANIFEST: Record<string, string> =
  ((stemManifest as unknown as { stems?: Record<string, string> })?.stems) ?? {};

/** 일간 인덱스 → 파일 키 (파일명과 1:1) */
export const DAY_STEM_FILE_KEY = [
  'kinoe', 'kinoto', 'hinoe', 'hinoto', 'tsuchinoe',
  'tsuchinoto', 'kanoe', 'kanoto', 'mizunoe', 'mizunoto',
] as const;

/**
 * 일간 상징 이미지 URL. 파일이 없으면 null → 화면은 이모지로 표시된다.
 * (이미지 유무와 무관하게 서비스는 항상 정상 동작한다)
 */
export function dayStemImage(stemIndex: number): string | null {
  const key = DAY_STEM_FILE_KEY[stemIndex];
  return key ? (STEM_MANIFEST[key] ?? null) : null;
}

/** 일간 폴백 이모지(이미지 준비 전) */
export const DAY_STEM_EMOJI = ['🌳', '🌿', '☀️', '🕯️', '⛰️', '🌾', '⚔️', '💎', '🌊', '💧'];

