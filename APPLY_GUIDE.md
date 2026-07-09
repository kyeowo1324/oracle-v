# Oracle V → ホシドタロ 리브랜딩

전체 리포지토리를 grep해서 "Oracle V"가 나온 모든 사용자 노출 지점을 찾아 교체했습니다.
빌드 검증 완료, 잔여 "Oracle V" 0건.

## 파일 배치 (전부 덮어쓰기)
| 파일 | 내용 |
|---|---|
| `public/manifest.json` | PWA 이름 → ホシドタロ |
| `public/og.png` | SNS 공유 이미지, 제목 텍스트 새로 그려서 교체 |
| `src/app/layout.tsx` | 메타데이터·JSON-LD 사이트명 |
| `src/app/page.tsx` | 홈 화면 표기 |
| `src/app/about/page.tsx` | 서비스 소개 페이지 |
| `src/app/faq/page.tsx` | FAQ 페이지 타이틀/설명 |
| `src/app/legal/contact/page.tsx` | **운영자: ホシドタロ / 이메일: hoshidotaro@gmail.com 로 확정 입력** |
| `src/app/legal/privacy/page.tsx` | 프라이버시폴리시 서비스명 |
| `src/app/legal/disclaimer/page.tsx` | 면책조항 서비스명 |
| `src/app/api/fortune/result/route.ts` | AI(Claude) 시스템 프롬프트 — AI가 자신을 소개할 때 쓰는 이름 |
| `src/app/api/decision/result/route.ts` | 〃 |
| `src/components/AdBanner.tsx` | 주석/설명 |
| `src/components/GuideArticle.tsx` | 가이드 글 공통 레이아웃 표기 |
| `src/components/MonthlyFortune.tsx` | 월별운세 표기 |
| `src/components/SiteFooter.tsx` | 푸터 표기 |
| `src/app/globals.css` | 코드 주석(사용자 비노출, 통일성만) |

## 확정한 정보
- 서비스명: **ホシドタロ**
- 운영자: **ホシドタロ** (서비스명과 동일하게 기재)
- 연락처: **hoshidotaro@gmail.com**

## 적용하지 않은 것 (건드릴 필요 없음)
- `package.json`의 `"name": "oracle-v"` — npm 내부 식별자일 뿐 화면에 안 보임, 그대로 둬도 무방
- Git 저장소 이름(`oracle-v`) — GitHub에서 별도로 바꾸고 싶으면 Settings → Rename, 코드 동작과는 무관
- `sitemap.ts`/`robots.ts`의 기본 URL 폴백값 `oracle-v.example.com` — 실제로는 `NEXT_PUBLIC_SITE_URL` 환경변수 값을 쓰므로 영향 없음

## ✅ 확인
- [ ] 홈·결과·가이드·FAQ·About 전부 ホシドタロ로 표시
- [ ] `/legal/contact`에서 운영자/이메일이 정확히 표시되는지
- [ ] 오늘의 운세 결과 문구에 (드물게) 서비스명이 언급될 때 ホシドタロ로 나오는지
- [ ] PWA로 "홈 화면에 추가" 시 이름이 ホシドタロ로 뜨는지
- [ ] SNS 공유 시 미리보기 이미지 제목이 ホシドタロ로 나오는지

## 모델명
변경 없음.
