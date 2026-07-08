# Oracle V — 2단계-B 애니메이션 (점술가·셔플·카드흔들림)

전부 순수 CSS/SVG. 이미지 파일 0, 용량 0.

## 파일 배치
| zip 파일 | 프로젝트 위치 | 동작 |
|---|---|---|
| src/components/FortuneTellerLoader.tsx | 동일 | 신규 (로딩 점술가) |
| src/components/ShuffleAnimation.tsx | 동일 | 신규 (셔플 모션) |
| src/app/(flow)/flow/TarotStep.tsx | 동일 | 덮어쓰기 (셔플 애니메이션 통합) |

styled-jsx(`style jsx`)를 사용합니다. Next.js 기본 지원. 에러 시 알려주세요.

## 적용된 것
1) 로딩 점술가: 수정구슬에 손 올린 점술가, 구슬 맥동·발광, 파동, 별 반짝임.
2) 셔플 모션: 셔플 버튼 → 카드 6장 섞임 + 골드 카드 빠져나옴. API와 애니메이션(최소 1.4초) 병렬 → 자동으로 선택 화면.
3) 홈 카드 흔들림: 2-A에서 rotate 유지로 이미 수정됨(별도 파일 불필요).

## 손으로 할 패치 — 결과 페이지 로딩 교체 (2곳)

### src/app/result/fortune/page.tsx
상단 import:
    import FortuneTellerLoader from '@/components/FortuneTellerLoader';
로딩 블록 교체:
    if (loading) {
      return <FortuneTellerLoader message="占っています" />;
    }

### src/app/result/decision/page.tsx
같은 방식, 메시지만:
    if (loading) {
      return <FortuneTellerLoader message="答えを占っています" />;
    }

## (선택) 홈 카드 흔들림 강화
src/app/page.tsx의 OmikujiCard sway 애니메이션: 4s→3s, translateY(-5px)→(-8px)

## 적용 후 확인
    rm -rf .next && npm run dev
- 셔플 버튼 → 카드 섞이는 애니메이션 후 선택 화면
- 결과 로딩 시 점술가+수정구슬 (패치 적용 시)
- 홈 카드 흔들림 정상

## 2단계 완료 후
- 배포 대비 마무리(의존성 위치·법적페이지·이미지)
- Vercel 배포 → AdSense 심사
