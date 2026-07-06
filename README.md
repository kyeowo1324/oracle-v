# Oracle V — 2026年 月別運勢(1〜7月) 콘텐츠 패키지

별자리 × 타로 조합의 **읽을거리 콘텐츠**입니다. 각 월: 그 달의 타로 1장 + 輝く星座 BEST + 注意 星座 + 행운의 색·아이템 + 개운 액션.

---

## ❓ "타로점을 보기 위해 필요한 것" — 답변

이건 **정적 읽을거리**라 실제 셔플/DB/API가 필요 없습니다. 그래서 추가로 필요한 데이터는 **없습니다.**
당신의 셔플 규칙(1월=1회, 2월=2회…)은 **콘셉트(스토리)로 반영**했습니다 —
각 월 페이지에 "○回シャッフルして引いた1枚" 문구로 살아있고, 그 달 테마 카드가 배정돼 있습니다.
(사용자가 실제로 뽑는 기능으로 만들려면 그건 별도의 '방식 B' 개발이 필요합니다.)

---

## 📁 배치

| 이 zip 파일 | 프로젝트 위치 | 비고 |
|---|---|---|
| `MonthlyFortune.tsx` | `src/components/MonthlyFortune.tsx` | 공통 레이아웃 |
| `monthly-2026.ts` | `src/data/monthly-2026.ts` | 1~7월 데이터 |
| `month-page.tsx` | `src/app/fortune-2026/[month]/page.tsx` | 개별 월(동적 라우트) |
| `index-page.tsx` | `src/app/fortune-2026/page.tsx` | 월별 목록 |

> `src/data/` 폴더가 없으면 새로 만드세요.
> `AdBanner` 컴포넌트(Stage2 패키지)가 먼저 있어야 합니다.

접근 URL: `/fortune-2026`(목록), `/fortune-2026/1` ~ `/fortune-2026/7`(각 월).

---

## 🔗 연결 (권장)

1. **푸터/홈에 링크 추가**: `SiteFooter.tsx`의 nav나 홈 가이드 섹션에
   `<Link href="/fortune-2026">2026年 月別運勢</Link>` 추가 → 심사관·사용자가 발견 가능.
2. **sitemap 반영**: `src/app/sitemap.ts`에 월별 URL을 추가하면 SEO에 유리:
   ```ts
   // 예시: monthly 7개월 추가
   import { MONTHLY_2026 } from '@/data/monthly-2026';
   // ...
   const monthly = MONTHLY_2026.map((m) => ({
     url: `${SITE_URL}/fortune-2026/${m.month}`,
     lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6,
   }));
   // return [...staticPages, ...guidePages, ...monthly];
   ```

---

## ⚠️ 공개 전에 (심사·품질)

각 월 데이터의 `overview`와 `action`을 한 번 읽고 **자기 말투로 1~2문 가필**하세요.
AI 대량 생성 티가 나면 심사에서 불리합니다. 7개월이라 부담이 적으니, 이 콘텐츠부터
손보면 효율이 좋습니다.

---

## 📚 조사 근거 (신뢰성)

2026년의 실제 별자리 흐름을 반영했습니다:
- **연 테마**: 丙午(병오) = 「표현·변혁·시작」의 해
- **주요 별의 움직임**: 2월 물병자리 금환일식 신월(始まりの扉) / 4월말 천왕성 이동(牡牛座의 전환) / 5~6월 사수자리 블루문 / 7월말 인연 포인트 이동(水瓶座)
- **연간 호평 별자리**: 여러 매체가 蠍座를 상위로. 水瓶座·蟹座·天秤座도 흐름 좋음

각 월의 타로는 번호순이 아니라 **그 달 공기에 맞는 象意**로 골랐습니다
(1월 愚者=시작 / 2월 星=희망 / 3월 女帝=결실 / 4월 運命の輪=전환 / 5월 力=인내 / 6월 太陽=충만 / 7월 恋人=인연).

---

## 참고 — 모델명
개발 원칙 문서의 `claude-3-5-haiku`/`claude-3-5-sonnet`은 구버전 표기.
코드는 `claude-haiku-4-5-20251001`/`claude-sonnet-4-6` 사용.
(이 콘텐츠는 정적이라 Claude 호출 없음.)
