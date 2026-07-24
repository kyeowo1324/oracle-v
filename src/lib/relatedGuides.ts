// src/lib/relatedGuides.ts
// 관련 글 추천 — 내부링크의 핵심.
//
// 왜 필요한가:
//   기존에는 20편 중 14편이 내부링크 0개인 "막다른 길"이었다.
//   막다른 길은 두 가지를 동시에 잃는다.
//     1) 검색: 구글은 내부링크를 따라 페이지를 발견·평가한다. 링크가 없으면 고립된다.
//     2) 수익: 읽고 나갈 곳이 없으면 1페이지만 보고 이탈 → 광고 노출도 1회로 끝난다.
//
// 설계:
//   - AI·DB를 쓰지 않는 결정론 규칙 → 비용 0, 항상 같은 결과(캐시·SSG와 궁합이 좋다)
//   - 같은 카테고리를 우선 채우고, 모자라면 다른 카테고리에서 보충
//   - 순환 추천이 되지 않도록 slug 해시로 시작점을 흩어 놓는다
//     (모든 글이 목록 앞쪽 글만 가리키면 뒤쪽 글은 영원히 고립된다)

export type GuideMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: boolean;
};

/** 문자열 → 안정적인 양의 정수 (배포마다 같은 값) */
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * 현재 글과 관련된 글 n편을 고른다.
 * @param all      전체 글 목록
 * @param current  현재 글 slug
 * @param n        추천 편수 (기본 3)
 */
export function pickRelatedGuides(all: readonly GuideMeta[], current: string, n = 3): GuideMeta[] {
  const pool = all.filter((a) => a.published);
  const others = pool.filter((a) => a.slug !== current);
  if (others.length === 0) return [];

  const me = pool.find((a) => a.slug === current);
  const myIndex = pool.findIndex((a) => a.slug === current);
  const seed = hashCode(current);
  const picked: GuideMeta[] = [];
  const taken = new Set<string>([current]);

  const push = (a?: GuideMeta) => {
    if (a && !taken.has(a.slug) && picked.length < n) {
      taken.add(a.slug);
      picked.push(a);
    }
  };

  // ① 같은 카테고리에서 우선 채운다 (문맥이 가장 잘 맞는 추천)
  //    단, 마지막 한 칸은 아래 ②를 위해 비워 둔다.
  const same = others.filter((a) => me && a.category === me.category);
  if (same.length > 0) {
    const start = seed % same.length;
    for (let i = 0; i < same.length && picked.length < n - 1; i++) {
      push(same[(start + i) % same.length]);
    }
  }

  // ② "순회 슬롯" — 전체 목록을 자기 위치에서 한 칸씩 밀며 고른다.
  //    이게 핵심이다. 같은 카테고리로만 채우면, 카테고리에 혼자뿐인 글
  //    (예: 血液型·夢占い)은 아무도 링크해 주지 않아 영원히 고립된다.
  //    각 글이 서로 다른 지점을 가리키므로 모든 글에 유입이 생긴다.
  if (pool.length > 1) {
    for (let step = 1; step < pool.length && picked.length < n; step++) {
      push(pool[(myIndex + step) % pool.length]);
    }
  }

  // ③ 그래도 모자라면 남은 글로 채운다
  for (const a of others) push(a);

  return picked.slice(0, n);
}
