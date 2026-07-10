# ホシドタロ — 공유 기능 점검 패치 (v3)

동기화된 소스 전수 점검 + "이미지 공유 복사 안 됨" 원인 분석·수정.
타입 체크(strict) + 폰트 폴백·줄바꿈 로직 단위 테스트 통과 확인 완료.

## 1. 전수 점검 결과 (이상 없음 확인)

S/A패치가 전부 정확히 적용된 것을 확인했습니다:
- `api/fortune/result` — 레이트리밋 429 / 입력 화이트리스트 / 타로 DB 재조회 / fortune_cache / fatal 500 ✅
- `api/decision/result` — AMBIGUOUS(ar18 등) / 질문 정규화 / 429 ✅
- `api/tarot/draw` — 난수 [0,1) / 모듈 캐시 ✅
- `result/fortune` — limited 분기 + DailyLimitScreen ✅
- `result/decision` — 429 상태코드 분기 + rate_limited 렌더 ✅
- `share/page` · `sitemap` · `layout` — SITE_URL 단일화 ✅
- `lib/collection` · `lib/daily` · `lib/dailyGate` — 로직 이상 없음 ✅

## 2. "이미지 복사가 안 된다" — 원인 3가지 (전부 수정)

**원인 ① 복사 경로가 아예 없었음.** 기존 코드는 네이티브 공유(navigator.share) →
실패 시 "조용한 다운로드(a.click)"뿐. 그런데 일본 유입의 주 경로인 **LINE·Instagram
인앱 브라우저에서는 이 두 가지가 모두 차단**되어 있어, 버튼을 눌러도 아무 일도
일어나지 않는 상태였습니다.

**원인 ② iOS Safari 제스처 만료.** 버튼 클릭 → 캔버스 합성(타로 이미지 3장 로드)을
기다리는 동안 "사용자 제스처" 유효시간이 지나 share()가 NotAllowedError로 실패하는
케이스.

**원인 ③ 캔버스 폰트 미적용.** next/font는 폰트를 "Shippori Mincho"라는 원래 이름이
아닌 내부 해시 이름으로 등록하므로, 캔버스의 리터럴 폰트 지정이 전부 기본 폰트로
폴백되고 있었습니다 (공유 이미지에 명조체가 안 나오던 이유).

### 수정 내용 (ShareResultImage v2)
| 수정 | 내용 |
|---|---|
| 🖼 画像をコピー 버튼 신설 | `ClipboardItem({'image/png': Promise<Blob>})`을 **클릭 핸들러 안에서 동기 생성** — Safari의 제스처 요건을 통과하는 유일한 패턴. 지원 브라우저에서만 표시 |
| 미리보기 모달 폴백 | 공유·복사·저장 모든 실패 경로의 최종 폴백. `<img>` 롱프레스(PC 우클릭)는 인앱 브라우저에서도 항상 동작하는 경로 |
| ⬇ 画像を保存 버튼 | 조용한 다운로드 대신 모달을 띄워 "저장하기" 링크 + 롱프레스 안내 |
| 합성 결과 캐시(ref) | 같은 결과 화면에서 1회만 합성 → 재시도는 제스처 안에서 즉시 실행 (원인② 완화) |
| 폰트 수정 | CSS 변수(--font-serif-jp/--font-sans-jp)에서 실제 등록명을 읽어 사용 + `document.fonts.ready` 대기 (원인③) |

캔버스 레이아웃(카드 배치·적응형 폰트 크기·구분선 등)은 기존과 **완전히 동일** —
시각적 회귀 없음.

### 함께 수정한 것
- **ShareButtons(리ンク 복사)**: `navigator.clipboard.writeText` 실패 시
  textarea + `execCommand('copy')` 레거시 폴백 추가 — 인앱 브라우저에서 링크 복사도
  안 되던 문제 해결. 성공했을 때만 "コピー済" 표시.
- **shareLink.ts**: 파일 내 자체 SITE_URL 정의 제거 → `@/lib/site` 단일 출처 (S-4 마무리).

## 3. 파일 배치 (전부 덮어쓰기)

| 파일 | 내용 |
|---|---|
| `src/components/ShareResultImage.tsx` | 복사 버튼 + 모달 폴백 + 폰트 수정 |
| `src/components/ShareButtons.tsx` | 링크 복사 레거시 폴백 |
| `src/lib/shareLink.ts` | SITE_URL 단일화 |

DB·API 변경 없음 — 프론트만이라 배포 즉시 반영.

## 4. 배포 후 QA

- [ ] **데스크톱 Chrome**: 🖼 画像をコピー → 메모장/트위터에 붙여넣기 되는지
- [ ] **iOS Safari**: 📤 셰어 → 공유 시트에 이미지 첨부 / 🖼 コピー → 사진에 붙여넣기
- [ ] **LINE 인앱 브라우저** (제일 중요 — LINE으로 자기에게 링크 보내고 열기):
      📤 셰어 → 미리보기 모달이 뜨고, 이미지 롱프레스로 저장 가능한지
- [ ] 공유 이미지의 결론 텍스트가 **명조체(Shippori Mincho)**로 나오는지 (폰트 수정 확인)
- [ ] ShareButtons 리ンク 버튼 → "コピー済"가 뜨고 실제로 붙여넣기 되는지
- [ ] 회귀: LINE/X/Threads 버튼, /share 링크 미리보기(OG 이미지)

## 5. 알아둘 것
- Firefox 데스크톱은 이미지 ClipboardItem 지원이 버전에 따라 달라, 미지원이면
  コピー 버튼이 자동으로 숨고 保存 버튼만 보입니다 (의도된 동작).
- 미리보기 모달의 "保存する"도 일부 인앱 브라우저에선 무시될 수 있으나,
  그 경우를 위해 롱프레스 안내가 항상 함께 표시됩니다.
