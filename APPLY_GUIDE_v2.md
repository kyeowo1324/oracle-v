# ホシドタロ — A단계 패치 (fortune_cache + 429 안내 UI)

S패치에 이어지는 후속 패치입니다. **S패치(특히 06_migration)가 먼저 적용되어 있어야 합니다.**
타입 체크(strict) + 캐시키 결정성 단위 테스트 통과 확인 완료.

## 이번 패치가 하는 일

1. **fortune_cache 적용** — 같은 날·같은 조합(주제×별자리×혈액형×성별×타로3장)의
   AI 결론/요약을 DB에 저장해 재사용. 캐시 HIT면 Claude 호출 0회.
   키에 날짜가 들어가 하루 단위로 자연 갱신되므로 "매일 바뀌는" 체감은 유지됩니다.
2. **429 전용 안내 화면** — 일일 상한에 걸린 사용자에게 일반 에러("取得に失敗")가 아니라
   "本日の利用上限に達しました" + 가이드 회유 동선을 보여줍니다 (체류시간 유지).
3. **fatal 에러 status 200 → 500 정리** — 클라이언트는 data.error로 판단하므로 호환.

## 적용 순서

### ① Supabase SQL 실행
`supabase/07_migration_fortune_cache.sql`
- 테이블 없으면 생성 / 있으면 conclusion 컬럼만 추가 (몇 번 실행해도 안전)
- **SQL 없이 코드만 배포해도 서비스는 안 죽습니다** — 캐시 조회가 조용히 실패하고
  매번 생성으로 동작(절감 효과만 없음). 그래도 순서는 SQL 먼저를 권장.

### ② 파일 배치

| 파일 | 상태 | 내용 |
|---|---|---|
| `supabase/07_migration_fortune_cache.sql` | 신규 | ①에서 실행 (레포에도 보관) |
| `src/app/api/fortune/result/route.ts` | 덮어쓰기 | S패치 + 캐시 적용 통합본 |
| `src/components/DailyLimitScreen.tsx` | 신규 | 429 전용 안내 화면 |
| `src/app/result/fortune/page.tsx` | 직접 수정 | `PATCH_result_pages.md` A항목 (3곳) |
| `src/app/result/decision/page.tsx` | 직접 수정 | `PATCH_result_pages.md` B항목 (3곳) |

### ③ 배포 후 QA

- [ ] 운세 1회 실행 → Supabase에서 `SELECT * FROM fortune_cache;` 에 1행 생성 확인
- [ ] **같은 조건으로 한 번 더** (시크릿 창에서 같은 별자리·혈액형·성별 + DevTools로
      같은 card_key 조합 재전송) → `hit_count`가 2로 증가 + 응답이 눈에 띄게 빨라짐
- [ ] Anthropic 콘솔 usage에서 두 번째 요청의 호출이 없는지 확인
- [ ] curl로 상한(기본 20회) 초과 → 결과 페이지에 "本日の利用上限" 화면이 뜨는지
      (S패치 가이드의 21회 curl 스크립트 재사용, 확인 후 ai_call_log 정리)
- [ ] 회귀: 운세/する・しない 정상 플로우, 공유 이미지·링크

## 설계 메모

- **캐시 히트도 일일 상한에 카운트됩니다.** 상한의 목적이 비용+DB 보호 둘 다이고,
  정상 사용자는 하루 20회에 닿지 않으므로 단순한 쪽을 택했습니다.
- **decision은 캐시하지 않습니다.** 자유 텍스트 질문이 키에 들어가 히트율이 사실상 0,
  캐시 조회 왕복만 낭비이기 때문입니다.
- 캐시 정리는 월 1회 운영 점검(E단계)에:
  `DELETE FROM fortune_cache WHERE last_used_at < now() - interval '14 days';`

## 다음 후보 (이번에 안 건드림)
- C-1 연속 방문 스트릭 + 今日の一枚 (리텐션)
- AdSense 승인 시 B단계 일괄 (Vercel Pro, 슬롯 교체, CMP)
