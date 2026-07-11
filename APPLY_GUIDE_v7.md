# ホシドタロ — 궁합 점 + 사운드 + 성격진단 (v7)

세 기능을 한 번에. 전부 타입 체크(strict) + 궁합 점수 결정론/관계별 차이 단위 테스트 통과.
승인 전 작업(v6)과 독립적으로 적용 가능.

═══════════════════════════════════════
## ① 相性占い (궁합 점) — 핵심 신기능
═══════════════════════════════════════

일본 궁합 사이트들을 조사해 정석 구조로 설계:
- 관계(恋愛/友情/仕事) 선택 → 두 사람(별자리 필수 + 혈액형·성별 선택) → 타로 4장 → 결과
- **타로 4장 = 다이아몬드 크로스** (あなたの気持ち / 相手の気持ち / 二人の現在 / 二人の未来)
  — 조사에서 초보용 2인 궁합 스프레드로 가장 널리 쓰이는 배치
- **궁합도는 서버가 결정론으로 계산**(별자리 엘리먼트 + 혈액형 16조합 + 타로 정역/방향).
  Claude는 그 점수를 "설명하는 문장"만 생성 → 같은 조합=같은 점수(신뢰감) + 캐싱(비용↓).
- 관계별 가중치가 달라 같은 두 사람도 恋愛/仕事에서 결과가 달라짐.

파일:
| 파일 | 내용 |
|---|---|
| `src/lib/compat.ts` | 궁합 점수 계산(결정론, $0) |
| `src/app/api/aisho-tarot/route.ts` | 궁합용 타로 4장 셔플(레어덱 대응, AI 없음) |
| `src/app/api/compat/result/route.ts` | 점수 계산 + AI 리딩 + 캐싱 + 429 |
| `src/app/compat/page.tsx` | 입력 페이지(관계→A→B) |
| `src/app/result/compat/page.tsx` | 결과(★+점수+세부+4장+리딩+공유) |

개인정보: 두 사람 정보를 받지만 **서버 저장 없이 계산만**(기존 방침). 화면에 명시함.

═══════════════════════════════════════
## ② サウンド (효과음 + BGM)
═══════════════════════════════════════

**전부 Web Audio로 코드 생성 — 오디오 파일 0개, 용량 0, 로딩 0.**
- `src/lib/useSound.ts` — 효과음 훅. tap(버튼)/shuffle(셔플)/reveal(결과)/star(레어).
  on/off를 localStorage 저장. 이미 compat 페이지들이 이 훅을 사용 중.
- `src/components/SoundControl.tsx` — 우측 상단 고정 토글(효과음/BGM 각각).
  **BGM은 기본 OFF** (자동재생 차단 + 점술 사이트 이탈 방지). 사용자가 켤 때만 재생.
  BGM도 코드 생성 앰비언트 루프(잔잔한 화음, 멜로디 없음).

적용 — layout.tsx에 한 줄:
```tsx
import SoundControl from '@/components/SoundControl';
// <body> 안, 최상단 근처에 배치 (전 페이지 우상단 고정):
<SoundControl />
```

기존 페이지에서 효과음을 더 쓰고 싶으면 (선택):
```tsx
import { useSound } from '@/lib/useSound';
const sound = useSound();
// 버튼 onClick에: sound.play('tap')
// 셔플 시작에: sound.play('shuffle')
// 결과 표시에: sound.play('reveal')
```
※ flow의 TarotStep·result 페이지들에 넣으면 통일감이 좋아집니다(필수 아님).

AdSense 주의: BGM 기본 OFF라 음성 광고와 충돌 없음. 효과음도 토글로 끌 수 있어 접근성 OK.

═══════════════════════════════════════
## ③ 星座×血液型 性格診断 (48패턴, SEO)
═══════════════════════════════════════

- `src/data/personality-48.json` — 12별자리 × 4혈액형 = 48패턴(성격/연애/일).
  규칙 기반 생성이라 문구 수정·추가가 쉬움.
- `src/app/seikaku/page.tsx` — 별자리+혈액형 선택 → 즉시 진단. 도구+SEO 텍스트.
- 검색 유입이 강한 키워드("牡羊座 A型 性格") 겨냥 → AdSense 콘텐츠로 우수.
- compat/오늘의 운세로 내부링크(회유 동선).

═══════════════════════════════════════
## 공통: sitemap + 홈 링크
═══════════════════════════════════════

- `src/app/sitemap.ts` — /compat, /seikaku 추가(덮어쓰기). ※ v6의 /aisho 포함 버전 기준.
  v6 미적용이면 이 파일이 /aisho도 함께 넣으므로 그대로 사용 가능.
- 홈(`src/app/page.tsx`)에 진입 링크 추가 (컬렉션 링크 아래, 같은 스타일):
```tsx
<Link href="/compat" className="mx-auto mt-3 flex w-full max-w-sm items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-3 font-sans text-sm text-[#D8D5EE] transition-colors hover:border-[#C9A227]">
  <span>💞 相性占い — 二人の相性を診断</span>
  <span className="text-[#C9A227]">→</span>
</Link>
<Link href="/seikaku" className="mx-auto mt-3 flex w-full max-w-sm items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-3 font-sans text-sm text-[#D8D5EE] transition-colors hover:border-[#C9A227]">
  <span>🔮 星座×血液型 性格診断</span>
  <span className="text-[#C9A227]">→</span>
</Link>
```

## 배포 후 QA
- [ ] /compat: 관계 선택 → A(별자리만) → B → 셔플 → 결과에 ★·점수·4장·리딩 표시
- [ ] 같은 두 사람+같은 관계 재점 → 점수 동일 (결정론 확인)
- [ ] 恋愛 vs 仕事로 관계만 바꿔 점수가 달라지는지
- [ ] 우상단 🔊 → 효과음 ON/OFF, BGM ON 시 잔잔한 소리, 새로고침 후 설정 유지
- [ ] /seikaku: 48조합 전환, SEO 텍스트, 내부링크
- [ ] /sitemap.xml 에 /compat /seikaku (있으면 /aisho) → Search Console 색인 요청
- [ ] 429(상한) 시 /result/compat 도 DailyLimitScreen 표시
- [ ] 레어 덱이 궁합 타로에서도 낮은 확률로 나오는지(rareChance 1.0 임시 테스트)

## 설계 메모
- compat은 fortune_cache 테이블을 재사용(summary_ja에 JSON 저장). 별도 테이블 불필요.
- 궁합 타로는 AI 없이 셔플만이라 상한 대상 아님. 리딩 생성(compat/result)만 상한 카운트.
- 성격진단·상성 로직은 /aisho(v6)와 관점을 공유 → 사용자 경험 일관성.
