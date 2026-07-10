# ホシドタロ — 운영 파라미터 런북 (RUNBOOK.md)

코드 구조를 몰라도 "이 숫자만 바꾸면 이 동작이 바뀐다"를 따라할 수 있도록
파일 경로·라인·현재값·바꾸는 법을 정리했습니다. 전부 프론트엔드 상수라
**배포(재빌드)만 하면 반영**되고, DB·Supabase 변경은 필요 없습니다.

---

## 0. 사전 준비 — dailyGate.ts 패치 (§3, §4를 쓰려면 필수)

기존 코드는 무료 조회를 "오늘 봤다/안 봤다"(true/false) 딱 1회로만 저장하는
구조라, 2회·5회처럼 **횟수**로 조정하려면 카운터 방식으로 바꿔야 합니다.
아래 파일로 **덮어쓰기** 한 번만 하면 이후 §3·§4는 숫자만 바꾸는 걸로 끝납니다.

**파일**: `src/lib/dailyGate.ts` — 전체를 첨부한 신버전으로 교체

바뀌는 것: 저장 방식만 내부적으로 boolean→카운터로 바뀌고, 기존에 이 파일을
가져다 쓰는 곳(`flow/page.tsx`, `result/fortune`, `result/decision`)의
`hasUsedFreeView()` / `markFreeViewUsed()` 호출 코드는 **한 글자도 안 바꿔도** 그대로 동작합니다.
기존 사용자의 저장값(v1, boolean)도 자동으로 인식해 마이그레이션합니다.

이 패치를 적용하면 파일 상단에 이런 블록이 생깁니다 — **런북의 모든 횟수 조작은 이 블록만 건드리면 됩니다**:

```ts
export const FREE_VIEW_LIMITS: Record<GateMode, number> = {
  fortune: 1,   // ← 오늘의 운세 하루 무료 횟수
  decision: 1,  // ← する・しない 하루 무료 횟수
};
```

---

## 1. 배경 별(StarrySky) 조작법

**파일**: `src/components/StarrySky.tsx`

배경은 3가지 레이어로 구성됩니다: ① 잔잔히 반짝이는 별(TWINKLE 배열) ②
가끔 흐르는 유성 6개(JSX에 하드코딩) ③ 드물게 떠오르는 별(RISING 배열).
전부 순수 CSS 애니메이션이라 서버·API와 무관하고, 파일 저장 후 새로고침하면
바로 반영됩니다.

### 1-1. 별 개수 늘리기/줄이기
```ts
// 상단 TWINKLE 배열 (현재 40개 항목)
const TWINKLE: [number, number, number, number][] = [
  [8, 12, 2, 0], [22, 34, 2, 1.2], ...
];
```
각 항목은 `[left%, top%, 크기px, 애니메이션 지연초]`. 항목을 추가하면 별이
늘고, 지우면 줍니다. 화면 밖으로 안 나가게 `left`/`top`은 0~100 사이로.

### 1-2. 반짝이는 속도 조절
파일 하단 `<style jsx>` 블록:
```css
.ss-tw {
  animation: ssTwinkle 3.8s ease-in-out infinite;  /* ← 3.8s가 한 번 깜빡이는 주기 */
}
```
숫자를 줄이면(예: `2s`) 더 빨리 깜빡이고, 늘리면(`6s`) 더 느긋해집니다.

### 1-3. 유성 빈도/속도
```tsx
<span className="ss-shoot absolute" style={{ left: '68%', top: '10%', animationDelay: '2s' }} />
```
6개의 `<span className="ss-shoot">` 태그가 이 파일에 나열돼 있습니다.
- 유성을 늘리려면: 같은 형식으로 `<span>` 한 줄을 복사해 `left`/`top`/`animationDelay`만 다르게
- 유성을 줄이려면: 태그를 지우면 그만큼 사라짐
- 주기(빈도)는 `animationDuration`(기본은 CSS의 `ssShoot 9s`를 따름, 개별 지정 시 그 값 우선)

주기 자체(한 유성이 스쳐 지나가는 사이클 길이)를 바꾸려면 하단 keyframes:
```css
@keyframes ssShoot {
  0%, 90% { opacity: 0; ... }   /* 90%까지는 안 보임 → 이 비율을 줄이면 더 자주 등장 */
  92% { opacity: 0.9; }
  98% { opacity: 0; ... }
}
```

### 1-4. 색상 바꾸기
현재 별 색은 `#F5E6A8`(금색 계열), 배경 그라디언트는 layout 밖 각 페이지의
인라인 `background: radial-gradient(...)`에 있습니다(예: `result/fortune/page.tsx`
상단의 `#2A2D6B`/`#1E2050`/`#14152B`). 별만 바꾸려면 `StarrySky.tsx` 안의
`bg-[#F5E6A8]` 두 곳(TWINKLE·RISING 렌더 부분)의 색상 코드만 교체하세요.

### 1-5. 완전히 끄고 싶을 때
각 페이지에서 `<StarrySky />`를 렌더하는 줄을 주석 처리하거나 지우면 됩니다
(예: `result/fortune/page.tsx`, `result/decision/page.tsx`, `flow/page.tsx` 등
"✦" 배경이 있는 모든 페이지에 개별적으로 들어가 있음 — 전체를 끄려면 각 파일에서
`import StarrySky` 줄과 `<StarrySky />` 사용 줄을 함께 제거).

---

## 2. "もう一度占う" 15초 대기시간 조작법

**파일**: `src/components/AdGateModal.tsx`

이 컴포넌트는 오늘 무료분을 다 쓴 사용자가 다시 들어왔을 때 뜨는 쿨다운
팝업입니다. 대기시간은 `seconds` prop으로 받고 **기본값이 15**입니다:

```tsx
// AdGateModal.tsx 함수 시그니처
export default function AdGateModal({
  onClose,
  seconds = 15,   // ← 이 숫자가 대기 초(秒)
}: {
  onClose: () => void;
  seconds?: number;
}) {
```

### 2-1. 대기시간 바꾸는 두 가지 방법

**방법 A — 기본값 자체를 바꾸기 (제일 간단, 호출부 수정 불필요)**
위 줄의 `seconds = 15`를 원하는 초로 바꿉니다. 예: 8초로 줄이려면 `seconds = 8`.

**방법 B — 호출하는 쪽에서 값을 넘기기 (모드별로 다르게 하고 싶을 때)**
현재 이 컴포넌트를 부르는 곳은 `src/app/(flow)/flow/page.tsx` 딱 한 곳뿐입니다:
```tsx
{gateOpen && <AdGateModal onClose={() => setGateOpen(false)} />}
```
여기에 `seconds={8}`처럼 넘기면 그 값이 기본값(15)보다 우선합니다:
```tsx
{gateOpen && <AdGateModal onClose={() => setGateOpen(false)} seconds={8} />}
```
fortune/decision 모드별로 다르게 주고 싶다면:
```tsx
{gateOpen && <AdGateModal onClose={() => setGateOpen(false)} seconds={isDecision ? 5 : 15} />}
```

### 2-2. 함께 조정하면 좋은 것 — 순환 팁 주기
같은 파일의 개운 팁(`TIPS` 배열)은 5초마다 자동으로 바뀝니다:
```tsx
const t = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 5000); // ← 5000ms
```
대기시간을 확 줄인다면(예: 8초) 이 주기도 `4000`(4초)처럼 같이 줄여야 팁이
2개 이상 보여집니다. 대기시간보다 이 값이 크면 팁이 한 번도 안 바뀌고 끝납니다.

### 2-3. 진행 게이지·문구는 자동 연동
"あと{remaining}秒でお進みいただけます" 버튼 텍스트와 진행 바(progress)는
`seconds` 값을 기준으로 자동 계산되므로, 위 두 방법 중 하나로 숫자만 바꾸면
다른 코드 수정 없이 전부 맞춰 움직입니다.

---

## 3. 오늘의 운세(fortune) 무료 조회 1회 → 2회로 변경

**전제**: §0의 `dailyGate.ts` 패치가 먼저 적용돼 있어야 합니다.

**파일**: `src/lib/dailyGate.ts`

```ts
export const FREE_VIEW_LIMITS: Record<GateMode, number> = {
  fortune: 1,    // ← 이 숫자를 2로 변경
  decision: 1,
};
```

→ `fortune: 2`로 바꾸고 저장, 재배포. **끝입니다.** 다른 파일은 손댈 필요 없음
— `flow/page.tsx`의 게이트 체크(`hasUsedFreeView('fortune')`)와 결과 페이지의
`markFreeViewUsed('fortune')`가 전부 이 상수를 자동으로 참조합니다.

### 확인 방법
1. 배포 후 오늘의 운세를 1회 실행 → 홈으로 돌아가 다시 진입 → **아직 팝업 안 뜸** (2회째 무료)
2. 2회째 결과까지 확인 → 다시 진입 → 이제 쿨다운 팝업이 뜨는지 확인
3. (로컬 테스트 시) 브라우저 DevTools → Application → Local Storage →
   `oracle_v_gate_v2` 키를 삭제하면 오늘 카운트가 즉시 리셋됩니다 (날짜 변경 대기 없이 재테스트 가능)

---

## 4. する・しない(decision) 무료 조회 1회 → 5회로 변경

**전제**: §0의 `dailyGate.ts` 패치.

**파일**: `src/lib/dailyGate.ts` (§3과 동일 파일, 같은 블록)

```ts
export const FREE_VIEW_LIMITS: Record<GateMode, number> = {
  fortune: 1,
  decision: 1,   // ← 이 숫자를 5로 변경
};
```

→ `decision: 5`로 바꾸고 저장, 재배포.

### 참고 — fortune과 decision은 완전히 독립적
두 값은 서로 영향을 주지 않습니다. `fortune: 2, decision: 5`처럼 동시에
다른 값을 줘도 문제없이 각자 카운트됩니다 (내부적으로 `fortune_count`/
`decision_count`를 따로 저장).

### 비용 관점 주의사항 (S-2 레이트리밋과의 관계)
이 무료횟수는 **UI상 광고 게이트를 언제 띄울지**를 정할 뿐이고, 실제 Claude
API 호출을 막는 것은 서버의 `AI_DAILY_LIMIT`(기본 IP당 20회, `rateLimit.ts`)
입니다. `decision: 5`로 늘려도 서버 상한 20회 안에서는 안전하지만, 만약
`fortune`+`decision` 무료횟수 합이 서버 상한에 가까워지면(예: 둘 다 10회로
올리는 경우) Vercel 환경변수 `AI_DAILY_LIMIT`도 함께 올리는 걸 검토하세요.
안 올려도 서비스가 깨지진 않습니다 — 상한 도달 시 §DailyLimitScreen 안내가
정상적으로 뜹니다.

---

## 5. 빠른 참조표

| 바꾸고 싶은 것 | 파일 | 라인/블록 |
|---|---|---|
| 배경 별 개수 | `src/components/StarrySky.tsx` | `TWINKLE` 배열 |
| 별 반짝이는 속도 | `src/components/StarrySky.tsx` | `.ss-tw { animation: ssTwinkle 3.8s ... }` |
| 유성 개수/위치 | `src/components/StarrySky.tsx` | `<span className="ss-shoot">` 6줄 |
| 떠오르는 별 개수 | `src/components/StarrySky.tsx` | `RISING` 배열 |
| 재시도 대기시간(15초) | `src/components/AdGateModal.tsx` | `seconds = 15` (기본값) 또는 `flow/page.tsx`의 호출부 |
| 팁 순환 주기(5초) | `src/components/AdGateModal.tsx` | `setInterval(..., 5000)` |
| 오늘의 운세 무료 횟수 | `src/lib/dailyGate.ts` | `FREE_VIEW_LIMITS.fortune` |
| する・しない 무료 횟수 | `src/lib/dailyGate.ts` | `FREE_VIEW_LIMITS.decision` |
| (참고) 서버 AI 호출 상한 | Vercel 환경변수 | `AI_DAILY_LIMIT` (기본 20) |

모든 항목은 프론트엔드 상수 변경이라 **git commit → push → Vercel 자동 재배포**
만으로 반영됩니다. Supabase SQL 실행이 필요한 항목은 이 런북에 없습니다.
