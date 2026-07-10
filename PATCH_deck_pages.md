// ============================================================
// PATCH_deck_pages.md — 결과 페이지 2곳 + package.json 수동 수정
// ============================================================

// ━━━ ① package.json — scripts에 두 줄 추가 (필수) ━━━
// "scripts" 블록에 predev/prebuild를 추가하세요 (기존 dev/build는 그대로).
{
  "scripts": {
    "predev": "node scripts/generate-deck-manifest.mjs",
    "prebuild": "node scripts/generate-deck-manifest.mjs",
    // ...기존 dev / build / start / lint 그대로...
  }
}
// npm은 dev/build 실행 전에 pre* 스크립트를 자동 실행 → 매니페스트가 항상 최신.


// ━━━ ② src/app/result/fortune/page.tsx — 컬렉션을 카드의 덱으로 기록 ━━━
// 기존:
/*
            recordCards('original', (data.tarot ?? []).map((c: any) => ({
*/
// 교체 (스프레드 전체가 같은 덱이므로 첫 카드의 deck_key 사용):
            recordCards((data.tarot?.[0]?.deck_key ?? 'original') as any, (data.tarot ?? []).map((c: any) => ({


// ━━━ ③ src/app/result/decision/page.tsx — 동일 ━━━
// 기존:
/*
            recordCards('original', [{
*/
// 교체:
            recordCards((data.card.deck_key ?? 'original') as any, [{


// ━━━ ④ (선택·추천) 레어 덱 당첨 배지 — fortune 결과 페이지 ━━━
// 5%짜리 순간을 사용자가 인지해야 재미가 삽니다. 결론 프레임 위에 삽입:
// 위치: <h1 ...>今日の運勢</h1> 아래 날짜 <p> 다음에 추가
        {result.tarot?.[0]?.deck_key && result.tarot[0].deck_key !== 'original' && (
          <p className="mt-3 text-center">
            <span className="inline-block animate-pulse rounded-full border border-[#C9A227] bg-[#C9A227]/15 px-4 py-1 text-[11px] tracking-widest text-[#F5E6A8]">
              ✨ レアデッキ出現！
            </span>
          </p>
        )}
// decision 페이지도 원하면 같은 블록에서 result.tarot?.[0] → result.card 로 바꿔 사용.
