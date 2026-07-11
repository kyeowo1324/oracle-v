# ホシドタロ — 추가 콘텐츠 4종 (v8)

전부 $0(정적 데이터 + 클라이언트 계산 또는 기존 API 재사용). AI 호출은 하나도 늘지 않음.
타입 체크(strict) + 주/방각 결정론 단위 테스트 통과.

## 4종 개요

| 페이지 | 경로 | 방식 | 비용 | 입력 |
|---|---|---|---|---|
| 今週の運勢 | `/weekly` | astrology_interpretations 재사용, 주 단위 결정론 | $0 | 별자리 |
| ラッキーアイテム | `/lucky` | lucky_* 재사용 + 방각/시간대 코드 계산 | $0 | 별자리(+혈액형) |
| 一枚引きタロット | `/hitokoto` | 기존 /api/tarot/draw 재사용(첫 장만) | $0 | 없음(가장 가벼운 진입점) |
| 相性ランキング | `/aisho-ranking` | compat.ts 엘리먼트 상성 재사용, 클라 계산 | $0 | 별자리 |

### 왜 이 4개인가 (조사 근거)
- 今週の運勢·ラッキーアイテム: 일본 점술 사이트의 표준 메뉴. 우리 DB에 이미 lucky_color/
  number/item과 variant가 있어 추가 데이터 없이 재사용 가능.
- 一枚引き: 입력 0단계라 신규 방문자의 첫 터치로 최적 → 오늘의 운세로 유도하는 훅.
- 相性ランキング: 조사에서 "당신과 궁합 좋은 별자리 랭킹" 형식이 인기. compat 기능과
  로직을 공유해 결과 일관성 확보.

## 파일 배치 (전부 신규)

| 파일 | 내용 |
|---|---|
| `src/app/api/weekly/route.ts` | 주간 운세 API (AI 없음) |
| `src/app/weekly/page.tsx` | 주간 운세 페이지 |
| `src/app/api/lucky/route.ts` | 럭키 요소 API (AI 없음) |
| `src/app/lucky/page.tsx` | 럭키 아이템 페이지 |
| `src/app/hitokoto/page.tsx` | 한 장 뽑기 (기존 draw API 재사용) |
| `src/app/aisho-ranking/page.tsx` | 상성 랭킹 (클라 계산) |
| `src/app/sitemap.ts` | 4개 경로 추가 (덮어쓰기) |

## 홈 링크 추가 (권장)
홈(`src/app/page.tsx`)의 기능 링크 목록에 추가. compat/seikaku 링크 아래에 같은 스타일로:
```tsx
<Link href="/weekly" className="mx-auto mt-3 flex w-full max-w-sm items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-3 font-sans text-sm text-[#D8D5EE] transition-colors hover:border-[#C9A227]">
  <span>📅 今週の運勢</span><span className="text-[#C9A227]">→</span>
</Link>
<Link href="/lucky" className="mx-auto mt-3 flex w-full max-w-sm items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-3 font-sans text-sm text-[#D8D5EE] transition-colors hover:border-[#C9A227]">
  <span>🍀 今日のラッキーアイテム</span><span className="text-[#C9A227]">→</span>
</Link>
<Link href="/hitokoto" className="mx-auto mt-3 flex w-full max-w-sm items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-3 font-sans text-sm text-[#D8D5EE] transition-colors hover:border-[#C9A227]">
  <span>🎴 一枚引きタロット</span><span className="text-[#C9A227]">→</span>
</Link>
<Link href="/aisho-ranking" className="mx-auto mt-3 flex w-full max-w-sm items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-3 font-sans text-sm text-[#D8D5EE] transition-colors hover:border-[#C9A227]">
  <span>👑 星座相性ランキング</span><span className="text-[#C9A227]">→</span>
</Link>
```
※ 홈이 너무 길어지면, 별도 "もっと占う" 섹션으로 묶거나 2열 그리드로 배치하는 것도 좋습니다.

## 배포 후 QA
- [ ] /weekly: 별자리 선택 → 그 주 날짜 범위 + 총합/연애/일 3카드 + 럭키. 요일 바꿔도 같은 주면 동일
- [ ] /lucky: 별자리(+혈액형) → 색/숫자/아이템/방위/시간대 5개. 혈액형 넣으면 결과 바뀜
- [ ] /hitokoto: 카드 뽑기 → 이미지+이름+해석, "もう一度引く" 동작
- [ ] /aisho-ranking: 내 별자리 → 11개 순위, 火風·地水가 상위인지
- [ ] 효과음: 각 페이지 버튼 탭·셔플 소리 (SoundControl OFF면 무음)
- [ ] /sitemap.xml 에 4경로 → Search Console 색인 요청

## 설계 메모
- weekly/lucky는 DB 읽기 전용(RLS 공개 데이터)이라 안전. revalidate로 캐시.
- 방각·시간대는 DB에 없어 코드로 결정론 계산(날짜+별자리+혈액형 해시).
- 相性ランキング은 compat.ts의 SIGN_ELEMENT를 import해 규칙 일관성 유지.
- 전부 AI 미사용이라 일일 상한(AI_DAILY_LIMIT)과 무관 — 무제한 조회 가능.

## 지금까지 만든 승인 전 작업 총정리 (배포 대기)
1. v6: 스트릭+今日の一枚, 상성체커(/aisho), 가이드 20편, FAQ 수정, 빵부스러기
2. v7: 궁합 점(/compat), 사운드(효과음+BGM), 성격진단(/seikaku)
3. v8: 今週の運勢, ラッキーアイテム, 一枚引き, 相性ランキング (이번)

→ 이제 한 번 배포 + QA를 돌려볼 좋은 시점입니다.
