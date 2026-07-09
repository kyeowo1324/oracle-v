// src/lib/shareLink.ts
// ホシドタロ — /share 링크 생성 유틸
// 기존 ShareButtons의 LINE/X/링크복사에서 이 함수로 만든 URL을 쓰면
// 카톡·라인·X 미리보기에 카드 이미지+AI텍스트가 자동으로 뜬다.
//
// 수정: encodeURIComponent를 직접 호출하지 않는다.
// URLSearchParams.set()이 이미 인코딩을 수행하므로, 직접 호출하면
// 이중 인코딩되어 OG 이미지에 "%E3%81%82…" 같은 깨진 문자가 그대로 표시된다.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoshidotaro.vercel.app';

type FortuneShareInput = {
  type: 'fortune';
  cardName: string;
  orientation: 'upright' | 'reversed';
  imageUrl: string;
  /** result.summary (AI 생성문) — DB 고정 해설(tarot[].text) 절대 금지 */
  aiText: string;
};

type DecisionShareInput = {
  type: 'decision';
  cardName: string;
  orientation: 'upright' | 'reversed';
  imageUrl: string;
  verdict: 'する' | 'しない' | 'どちらでも';
  /** result.advice (AI 생성문) — DB 고정 해설(card.text) 절대 금지 */
  aiText: string;
};

export function buildShareUrl(input: FortuneShareInput | DecisionShareInput): string {
  const params = new URLSearchParams();
  params.set('type', input.type);
  params.set('card', input.cardName);
  params.set('orientation', input.orientation);
  params.set('image', input.imageUrl);
  params.set('text', input.aiText.slice(0, 120)); // URL 길이 제한 대비
  if (input.type === 'decision') {
    params.set('verdict', input.verdict);
  }
  return `${SITE_URL}/share?${params.toString()}`;
}
