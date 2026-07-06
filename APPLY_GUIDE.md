# Oracle V — Stage 2 완성도 개선 패키지 (적용 가이드)

Stage 2 실제 배치 상태를 분석해 발견한 문제를 수정하고 완성도를 올린 패키지입니다.

---

## 🔍 분석으로 발견한 문제 → 이 패키지의 해결

| # | 심각도 | 문제 | 해결 |
|---|---|---|---|
| 1 | 🔴 | 홈 가이드 링크 3개가 죽은 URL(/guide/astrology 등) → 404 | 실제 존재하는 slug + 목록(/guide)으로 교체 |
| 2 | 🔴 | 법적·가이드 페이지로 가는 링크가 사이트에 없음(심사 위험) | **전역 푸터** 신규 → 모든 페이지에 노출 |
| 3 | 🔴 | 홈·결과 광고가 점선 박스 하드코딩(승인돼도 안 나옴) | **AdBanner** 실제 적용 |
| 4 | 🟡 | 폰트가 홈에서만 로드(다른 페이지는 기본폰트) | **next/font를 layout으로** 이전 → 전 페이지 일관 |
| 5 | 🟡 | 가이드 글 1편(심사 최소 10편 미달) + 추가 부담 큼 | **GuideArticle 공통 컴포넌트** + 글 2편으로 |
| 6 | 🟢 | 검색엔진 구조화 데이터 없음 | layout·글에 **JSON-LD**(WebSite/Article) |

---

## 📁 파일 배치

| 이 zip 파일 | 프로젝트 위치 | 동작 |
|---|---|---|
| `layout.tsx` | `src/app/layout.tsx` | 덮어쓰기 (폰트+푸터+JSON-LD) |
| `globals.css` | `src/app/globals.css` | 덮어쓰기 (폰트 변수 연결) |
| `SiteFooter.tsx` | `src/components/SiteFooter.tsx` | 신규 |
| `GuideArticle.tsx` | `src/components/GuideArticle.tsx` | 신규 |
| `guide/page.tsx` | `src/app/guide/page.tsx` | 덮어쓰기 (글 2편 반영) |
| `guide/astrology-basics/page.tsx` | `src/app/guide/astrology-basics/page.tsx` | 덮어쓰기 (공통 레이아웃판) |
| `guide/tarot-basics/page.tsx` | `src/app/guide/tarot-basics/page.tsx` | 신규 (2번째 글) |
| `PATCH_page.tsx.txt` | — | 홈 `page.tsx` 수동 패치 안내(2곳) |

---

## ✋ 손으로 해야 하는 패치 (자동 아님)

### 1. 홈 `src/app/page.tsx` — `PATCH_page.tsx.txt` 참고
- import에 `AdBanner` 추가
- 점선 광고 박스 → `<AdBanner slot="..." />`
- 죽은 가이드 링크 3개 → astrology-basics + 목록(/guide)

### 2. 결과 페이지 광고 박스 → AdBanner (2곳)
`src/app/(flow)/result/fortune/page.tsx` 와 `.../decision/page.tsx` 안의
```tsx
<div className="... border-dashed ...">広告 · 320×100</div>
```
를 다음으로 교체:
```tsx
import AdBanner from '@/components/AdBanner';   // 파일 상단
// ...
<AdBanner slot="0000000000" />
```
> ⚠️ **로딩 화면 안의 광고 박스는 그대로 두거나 제거**하세요.
> "콘텐츠 없는 로딩 단독 화면"에는 광고를 넣지 않는 것이 AdSense 정책입니다.

---

## ✅ 적용 후 확인
```bash
rm -rf .next && npm run dev
```
- [ ] 모든 페이지 하단에 **푸터**(개인정보·면책·문의·가이드) 보이는지
- [ ] 홈 가이드 링크 클릭 → 404 안 나는지
- [ ] `/guide` 목록에 글 **2편** 보이는지, 글 안에서 목록 복귀 링크 동작
- [ ] 가이드·법적 페이지 폰트가 홈과 동일하게 적용됐는지
- [ ] 개발 모드에서 광고 자리에 "広告スペース(審査通過後に表示)" 점선 보이는지

---

## 🎯 남은 콘텐츠 작업 (코드 아님, 당신 몫)
심사 통과의 실질 병목은 **원본 글 10~15편**입니다. 이제 틀이 잡혔으니:
1. `guide/page.tsx`의 `published:false` 4편을 GuideArticle로 작성
2. 각 글을 한 번 읽고 **체험·사례 1~2단락 가필**(AI 티 제거 = 독자성)
3. 다 쓰면 `published: true`

주제 추천(일본 검색 수요 높음): 血液型別の相性 / 星座別の2026年運勢 / タロット恋愛スプレッド / 開運アクション / 誕生日でわかる性格.

---

## 참고 — 모델명
개발 원칙 문서의 `claude-3-5-haiku`/`claude-3-5-sonnet`은 구버전 표기.
코드는 `claude-haiku-4-5-20251001`/`claude-sonnet-4-6` 사용.
(이 Stage 2 개선분에는 Claude 호출 없음.)
