# ホシドタロ — 빌드 에러 해결 최종본 (한 번에 완결)

## 무엇이 문제였나

반복된 `Module not found` 에러의 근본 원인:
**"새 페이지는 넣었는데, 그 페이지가 import하는 새 파일(useSound 등)을 함께 안 넣어서"**
빌드가 그 import에서 멈춘 것입니다. 이번엔:
1. 홈을 **자기완결(self-contained)** 로 다시 작성 — 스트릭 배너·서비스 타일·효과음을
   전부 홈 파일 안에 인라인. 이제 홈은 **확실히 존재하는 3개**(StarrySky / AdBanner /
   AppInstallCard)만 import하므로, 다른 신규 파일이 없어도 홈은 절대 안 깨집니다.
2. 신규 페이지들이 의존하는 **lib/data 파일을 이 번들에 전부 포함**시켜, 서로의 의존이
   완전히 충족되게 했습니다.

## 적용 방법 (덮어쓰기만)

이 zip의 `src/` 폴더를 프로젝트의 `src/`에 **그대로 덮어쓰기** 하세요.
파일을 직접 수정할 필요는 없습니다. 포함된 파일:

**덮어쓰기(신규 or 교체):**
```
src/app/page.tsx                       ← 홈 (self-contained, 이번 에러 해결의 핵심)
src/lib/useSound.ts                    ← 효과음 (신규 페이지들이 의존)
src/lib/compat.ts                      ← 궁합 점수 계산
src/lib/collection.ts                  ← recordCardsGated 추가본
src/lib/collectionGate.ts              ← 컬렉션 하루 등록 상한
src/lib/site.ts                        ← SITE_URL 단일화
src/data/personality-48.json          ← 성격진단 데이터
src/components/SoundControl.tsx        ← 사운드 토글 + BGM
src/app/compat/page.tsx
src/app/result/compat/page.tsx
src/app/seikaku/page.tsx
src/app/weekly/page.tsx
src/app/lucky/page.tsx
src/app/hitokoto/page.tsx
src/app/aisho/page.tsx
src/app/aisho-ranking/page.tsx
src/app/api/aisho-tarot/route.ts
src/app/api/compat/result/route.ts
src/app/api/weekly/route.ts
src/app/api/lucky/route.ts
```

## 배포 전 필수 확인 (중요)

프로젝트 루트에 이 zip의 `VERIFY_imports.mjs`를 두고 실행하세요:
```
node VERIFY_imports.mjs
```
- **"✅ 모든 @/ import가 …해결됩니다"** 가 나오면 → 빌드 안전. 배포하세요.
- **"❌ …파일이 없습니다"** 가 나오면 → 그 파일이 레포에 없다는 뜻.
  목록에 나온 파일을 추가하거나, (기존 파일이라면) 어느 패치에서 빠졌는지 알려주세요.

이 스크립트가 **지금까지 반복된 빌드 에러를 배포 전에 미리 잡아줍니다.**

## 이 번들이 "레포에 이미 있다"고 가정하는 파일들

아래는 이전 패치(S/A/공유/레어덱)에서 이미 추가됐어야 하는 것들입니다.
`VERIFY_imports.mjs`가 이들을 "없음"으로 표시하면, 해당 패치가 누락된 것이니 알려주세요:
```
@/components/StarrySky, AdBanner, AppInstallCard, DailyLimitScreen,
  FortuneTellerLoader, ShareButtons, ShareResultImage, ShuffleAnimation
@/lib/daily, decks, rateLimit
```

## 컬렉션 남용 개선 (지난 요청분 포함)

`一枚引き`의 무제한 뽑기로 도감이 순식간에 차는 문제:
- 뽑기는 계속 무제한, 단 **도감 신규 등록은 하루 5장까지**(collectionGate.ts).
- 이미 가진 카드 재뽑기는 무제한. 상한은 `DAILY_NEW_CARD_LIMIT` 값으로 조정.

## 배포 후 QA
- [ ] `node VERIFY_imports.mjs` → ✅
- [ ] `npm run build` 통과
- [ ] 홈: 카테고리 4섹션 표시, 스트릭 배너(기록 있으면), 타일 탭 시 효과음
- [ ] 一枚引き: 신규 5장까지 "登録！", 6번째 "上限"
- [ ] 사운드 토글(우상단), BGM 8초마다 화음 전환
