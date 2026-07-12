# ホシドタロ — 빌드 에러 수정 + 컬렉션 남용 개선 (v10)

타입 체크(strict) + 게이트 로직 단위 테스트 통과.

═══════════════════════════════════
## ① 빌드 에러 수정 (module not found)
═══════════════════════════════════

**원인**: v9 홈이 `@/components/DailyHomeWidget`를 import하는데, 이 컴포넌트는
v6 패치에 포함돼 있었습니다. v6의 `DailyHomeWidget.tsx`(및 v6판 streak.ts)를
적용하지 않으셨거나, 기존 레포에 이미 **다른 스트릭 시스템**이 있어서
(`StreakBanner.tsx` + `streak.ts`의 `touchStreak`/`peekStreak`) 충돌했습니다.

**분석**: 기존 레포에는 이미
- `src/lib/streak.ts` — `touchStreak()` / `peekStreak()` export
- `src/components/StreakBanner.tsx` — `peekStreak` 사용
가 존재합니다. 제가 v6에서 만든 `DailyHomeWidget`/`recordVisit`는 이 기존
시스템과 이름이 안 맞아 불필요한 중복이었습니다.

**해결**: 홈이 **기존 `StreakBanner`를 쓰도록** 수정. `DailyHomeWidget` 의존 제거.
- `src/app/page.tsx` (덮어쓰기): `import DailyHomeWidget` → `import StreakBanner`,
  `<DailyHomeWidget />` → `<StreakBanner />`
- v6에서 받았던 `DailyHomeWidget.tsx`와 v6판 `streak.ts`는 **적용하지 마세요**
  (기존 streak.ts를 덮어쓰면 StreakBanner가 깨집니다). 이미 넣으셨다면 아래 "정리" 참고.

### 만약 v6 streak.ts / DailyHomeWidget을 이미 넣으셨다면 (정리)
1. `src/lib/streak.ts`를 **기존 버전**(touchStreak/peekStreak)으로 되돌리기
   — 기존 버전이 없다면, 이 zip의 `streak.ts`(기존 시그니처 복원본)를 사용
2. `src/components/DailyHomeWidget.tsx` 삭제
3. `today의一枚` 위젯을 홈에서 쓰고 싶다면 별도 요청 주세요(기존 streak과 호환되게 재작성).

═══════════════════════════════════
## ② 一枚引き 컬렉션 남용 개선
═══════════════════════════════════

**문제**: 一枚引き는 무제한으로 뽑을 수 있어, 도감(컬렉션)에 무분별하게 등록하면
수집의 재미(매일 조금씩 모으는 가치)가 순식간에 붕괴됩니다.

**분석 & 설계 판단**:
- 뽑기 자체를 막으면(횟수 제한) 엔터테인먼트가 훼손됨 → 뽑기는 계속 무제한 유지.
- 대신 **"도감에 새로 등록되는 카드"를 하루 N장(기본 5장)까지만** 제한.
  → 가챠/도감의 핵심 리듬("매일 조금씩 모인다")을 지키면서 매일 방문 동기(리텐션) 생성.
- 이미 가진 카드를 다시 뽑는 건 무제한(count만 증가) — 자연스러움.
- 오늘의 운세(3장)·する・しない(1장)는 원래 무료 게이트가 있어 남용이 어려우므로
  **그대로 두고**, 무제한인 一枚引き에만 이 게이트를 적용.

**구현**:
| 파일 | 상태 | 내용 |
|---|---|---|
| `src/lib/collectionGate.ts` | 신규 | 하루 신규 등록 상한(DAILY_NEW_CARD_LIMIT=5) 관리, localStorage |
| `src/lib/collection.ts` | 덮어쓰기 | `recordCardsGated()` 추가 (기존 recordCards는 그대로 유지) |
| `src/app/hitokoto/page.tsx` | 덮어쓰기 | 뽑기 결과를 게이트 통해 등록 + 안내 문구 |

동작:
- 신규 카드 등록 시: "✨ コレクションに登録！ 本日あと4枚"
- 상한 도달 후: "本日のコレクション登録は上限(5枚)に達しました。明日また集められます"
- 이미 가진 카드: "（このカードはすでにコレクション済み）"

상한 조정: `collectionGate.ts`의 `DAILY_NEW_CARD_LIMIT` 값만 바꾸면 됩니다.

═══════════════════════════════════
## 배포 후 QA
═══════════════════════════════════
- [ ] **빌드 통과** (npm run build 에러 없음) ← 최우선
- [ ] 홈에 스트릭 배너 정상 표시 (StreakBanner)
- [ ] 一枚引き로 서로 다른 카드 6장 연속 뽑기 → 5장까지 "登録！", 6번째 "上限に達しました"
- [ ] 이미 가진 카드 재뽑기 → "すでにコレクション済み", 남은 수 안 줄어듦
- [ ] 컬렉션 페이지에서 오늘 등록한 5장까지만 반영됐는지
- [ ] 날짜 바뀐 뒤(또는 localStorage `hoshidotaro:coll_gate:v1` 삭제) 다시 5장 등록 가능

## 설계 메모
- 게이트는 localStorage라 기기별. 완벽한 방지가 아니라 "일반 사용자의 남용 완화 +
  리텐션" 목적(제로코스트 원칙). 로그인 없이 서버 비용 $0.
- recordCardsGated는 기존 recordCards를 대체하지 않음 — 오늘의 운세/する・しない은
  기존 recordCards 그대로. 一枚引き만 게이트 버전 사용.
- 향후 컬렉션 진척이 계정에 묶이길 원하면(기기 간 동기화), Supabase 연동이 필요하지만
  현재 규모에선 localStorage로 충분.
