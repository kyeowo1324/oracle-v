# ホシドタロ — S패치 (보안·로직 일괄 수정)

빌드 전 타입 체크(strict) + 핵심 로직 단위 테스트 통과 확인 완료.

## 적용 순서 (중요 — 이 순서대로)

### ① Supabase SQL 먼저 실행
`supabase/06_migration_rate_limit.sql` 을 SQL Editor에서 실행.
- `increment_ai_call`이 void → **count 반환**으로 변경 (DROP 후 재생성)
- 기존 배포 코드는 반환값을 안 쓰므로, SQL을 먼저 실행해도 서비스 무중단.
- **역순(코드 먼저 배포)은 금지**: 새 코드가 count를 못 받으면 fail-open이라
  차단은 안 되지만, 상한이 작동하지 않는 상태로 배포됩니다.

### ② 파일 배치 (전부 덮어쓰기 / 신규)

| 파일 | 패치 | 내용 |
|---|---|---|
| `supabase/06_migration_rate_limit.sql` | S-2 | ①에서 실행 (레포에도 보관) |
| `src/lib/site.ts` | S-4 | 신규 — SITE_URL 단일 출처 |
| `src/lib/rateLimit.ts` | S-2 | 신규 — 일일 AI 상한 헬퍼 (기본 20회/IP, `AI_DAILY_LIMIT` env로 조정) |
| `src/app/api/fortune/result/route.ts` | S-2,S-3 | 상한 429 + 입력 화이트리스트 + 타로 해석 DB 재조회 |
| `src/app/api/decision/result/route.ts` | S-1,S-2,S-3 | **どちらでも 버그 수정** + 상한 + 질문 100자 정규화 + DB 재조회 |
| `src/app/api/tarot/draw/route.ts` | S-5 | 난수 [0,1) 수정 + 카드 데이터 10분 모듈 캐시 |
| `src/app/layout.tsx` | S-4,S-5 | SITE_URL 통일 + `maximumScale:1` 제거(접근성) |
| `src/app/sitemap.ts` | S-4 | SITE_URL 통일 |
| `src/components/GuideArticle.tsx` | S-4 | SITE_URL 통일 |
| `next.config` | S-5 | `PATCH_next.config.md` 참고해 headers() 수동 추가 |

### ③ 한 줄 패치 (직접 수정 — 파일 전체를 못 받은 곳)

**`src/components/MonthlyFortune.tsx`** — 상단의
```ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oracle-v.example.com';
```
을 삭제하고 import에 추가:
```ts
import { SITE_URL } from '@/lib/site';
```

**`src/app/share/page.tsx`** — 상단의
```ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoshidotaro.vercel.app';
```
→ 같은 방식으로 `import { SITE_URL } from '@/lib/site';` 로 교체.

**`src/app/api/og/route.tsx`** — 파일 내 2곳의
`process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoshidotaro.vercel.app'`
→ `SITE_URL` (상단에 `import { SITE_URL } from '@/lib/site';` 추가).
※ Edge 런타임에서도 NEXT_PUBLIC_ env는 빌드 시 인라인되므로 문제 없음.

**`src/app/robots.ts`** — 있다면 열어서 폴백이 `oracle-v.example.com`이면 동일하게 교체.

### ④ 배포 후 QA 체크리스트

- [ ] **S-1**: する・しない을 여러 번 돌려 月(ar18)·女教皇(ar02)·吊るされた男(ar12)·運命の輪(ar10)이 나왔을 때 「どちらでも」가 뜨는지. 급하면 브라우저 DevTools → Network에서 `/api/decision/result` 요청 body의 `card_key`를 `ar18`로 바꿔 재전송해 즉시 확인 가능
- [ ] **S-2**: 터미널에서 아래를 21회 반복 → 21번째부터 429 확인
  ```bash
  for i in $(seq 1 21); do curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://hoshidotaro.vercel.app/api/decision/result \
    -H 'Content-Type: application/json' \
    -d '{"question":"test","tarotShuffleResult":[{"card_key":"ar00","orientation":"upright"}]}'; done
  ```
  확인 후 Supabase에서 정리: `DELETE FROM ai_call_log WHERE call_date = CURRENT_DATE;`
- [ ] **S-3**: body 없이 POST → 400 / `question`에 300자 넣어도 결과 정상(프롬프트엔 100자만)
- [ ] **S-4**: 가이드 아무 글이나 열어 소스보기 → JSON-LD `mainEntityOfPage`가 실제 도메인인지
- [ ] **S-5**: `curl -sI https://hoshidotaro.vercel.app | grep -i x-frame` 헤더 확인, 모바일에서 핀치줌 되는지
- [ ] 기존 플로우 회귀: 홈→운세→결과, 홈→する・しない→결과, 공유 이미지/링크

## 주의사항 2가지

1. **429 시 클라이언트 표시**: 두 result API가 이제 429를 반환할 수 있습니다. 결과 페이지
   (`result/fortune`, `result/decision`)의 fetch가 `res.ok`만 보고 있다면 일반 에러 화면이
   뜰 텐데, 동작엔 문제 없지만 다음 작업에서 "本日の上限に達しました" 전용 안내로 다듬는 것을
   추천합니다 (응답 JSON에 `message` 필드를 넣어뒀습니다).
2. **상한 20회의 근거**: 정상 사용자는 하루 fortune 1 + decision 1 + 재시도 몇 번 = 5회 미만.
   20회는 가족 공유 IP·회사 IP를 감안한 여유치입니다. 트래픽을 보고 `AI_DAILY_LIMIT`
   환경변수로 조정하세요 (코드 수정 불필요).

## 이번에 안 건드린 것 (다음 후보)

- fortune_cache 적용 (`_reference/route-WITH-CACHE.ts.txt` 기반, topic을 캐시키에 추가 필요) — A단계
- fatal 에러의 status 200 반환 → 클라이언트 에러 처리와 함께 손봐야 해서 보류
- CSP 헤더 — AdSense 게재 안정화 후 report-only로 시작 (PATCH_next.config.md 참고)
