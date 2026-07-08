# Oracle V — 3단계 (셔플 개선 · 점술가 적용 · 아이콘 애니메이션 · 카드 확대 · 배포 마무리)

GitHub 저장소(kyeowo1324/oracle-v)를 직접 clone해서 분석·수정·`next build` 검증까지 마친 패치입니다.

## 파일 배치 (전부 덮어쓰기 / 신규)

| 파일 | 동작 | 내용 |
|---|---|---|
| `src/components/ShuffleAnimation.tsx` | 덮어쓰기 | 셔플 v2 — 리플 셔플 |
| `src/components/ZoomableTarotCard.tsx` | **신규** | 타로 카드 탭 → 확대 모달 |
| `src/app/result/fortune/page.tsx` | 덮어쓰기 | 점술가 로더 적용 + 확대 카드 |
| `src/app/result/decision/page.tsx` | 덮어쓰기 | 점술가 로더 적용 + 확대 카드 |
| `src/app/page.tsx` | 덮어쓰기 | 카드 sway 제거 → 아이콘 애니메이션 |
| `package.json` | 덮어쓰기 | 의존성 위치 교정 (아래 참고) |
| `tsconfig.json` | 덮어쓰기 | scripts/_reference 빌드 제외 |
| `public/manifest.json` | 덮어쓰기 | 브랜드 색상으로 교정 |
| `public/og.png` | **신규** | OG 이미지 (1200×630) |
| `public/icons/icon-192.png` / `icon-512.png` | **신규** | PWA 아이콘 |
| `_reference/route-WITH-CACHE.ts.txt` | 이동 | 아래 삭제 항목 참고 |

## ⚠️ 삭제할 파일 1개
`src/app/api/fortune/result/route-WITH-CACHE.ts` 를 **삭제**하세요.
(참고용 백업은 zip의 `_reference/route-WITH-CACHE.ts.txt`로 이동해뒀습니다.
src 안에 두면 빌드 타입체크 대상이 되어 위험합니다.)

## package.json 변경 후 반드시
```bash
rm -rf node_modules .next
npm install
npm run dev
```
- `@anthropic-ai/sdk` `@supabase/supabase-js` → dependencies로 이동 (런타임 의존성)
- `next-pwa` 제거 (어디서도 사용 안 함 + Next 16과 비호환)

## 고친 문제들

### 1) 점술가가 안 나왔던 이유 (핵심)
이전 단계의 "손으로 할 패치"(결과 페이지 로딩 블록 교체)가 **적용되지 않은 상태**였습니다.
이번엔 두 결과 페이지를 파일째 교체해서 확실히 반영:
- 오늘의 운세 결과 로딩 → 점술가 "占っています"
- する・しない 결과 로딩 → 점술가 "答えを占っています"

### 2) 셔플 v2 (리플 셔플)
기존: 카드들이 2패턴으로만 좌우 왕복(겹쳐 떨림) + 골드 카드 무한 반복 팝업 → 어색.
신규: 덱이 **좌·우 두 뭉치로 갈라짐 → 한 장씩 교차로 겹쳐 합쳐짐 → 정돈** 을
반복하는 실제 리플 셔플 동작. 골드 팝업 카드 제거, 은은한 글로우로 대체.

### 3) 홈 아이콘 마이크로 애니메이션
카드 전체 흔들림(sway) 제거. 대신:
- 오늘의 운세: SVG 별이 숨쉬듯 커졌다 작아지며 발광 + 작은 스파클 2개 교차 점멸
- する・しない: 대나무에 매달린 골드 단자쿠가 살랑살랑 스윙 + 잎 흔들림
카드는 기울기만 유지한 정적 + 호버 시 떠오름.

### 4) 타로 카드 확대 (신규)
결과 화면의 카드(운세 3장·결단 1장)를 탭하면 전체 화면 모달로 확대.
- 역위치는 확대에서도 180° 유지
- 배경 탭 / × / ESC로 닫기, 열림 중 스크롤 잠금
- 썸네일 우하단에 🔍 힌트 표시

### 5) 배포 대비 마무리 (빌드 검증 완료)
- **빌드 블로커 해결**: `scripts/` 시딩 스크립트의 타입 에러가 `next build`를
  실패시키고 있었음 → tsconfig에서 scripts 제외 (Vercel 배포가 이 상태론 실패했을 것)
- **404 리소스 해결**: layout/manifest가 참조하던 `/og.png`, `/icons/icon-192.png`,
  `/icons/icon-512.png`가 실제로 없었음 → 브랜드 스타일로 생성해 포함
- manifest 색상을 브랜드(#14152B)로 교정
- 의존성 위치 교정 + 미사용 next-pwa 제거

## ✅ 적용 후 확인
- [ ] 셔플 버튼 → 두 뭉치 갈라졌다 교차로 합쳐지는 리플 셔플
- [ ] 오늘의 운세 / する・しない **양쪽 모두** 결과 로딩에 점술가 등장
- [ ] 홈: 별이 반짝이고 단자쿠가 흔들림 (카드 자체는 정적)
- [ ] 결과 카드 탭 → 확대 모달, 역위치 반전 유지, ESC/배경/×로 닫힘
- [ ] `npm run build` 통과 (Vercel 배포 가능 상태)

## 배포 직전 남은 일 (코드 외)
1. Vercel 프로젝트 생성 → GitHub 연결
2. 환경변수 등록: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_SITE_URL`(배포 도메인)
3. 법적 페이지의 운영자 정보(이름·연락처) 실제 값으로 차환
4. 가이드 글에 본인 경험 단락 보강 (AdSense 심사 대비)
5. 광고 게재 시점에 Vercel Pro 전환 검토 (Hobby 상업 이용 제한)

## 모델명
변경 없음 (이번 단계는 AI 호출 코드 미변경).
