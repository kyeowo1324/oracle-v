// scripts/generate-deck-manifest.mjs
// ホシドタロ — 덱 매니페스트 자동 생성 (빌드 시 실행)
//
// 하는 일: public/tarot-images/ 의 하위 폴더를 스캔해서
// "어떤 덱에 어떤 카드 이미지가 실제로 존재하는지"를
// src/data/deck-manifest.json 으로 기록한다.
//
// 이 파일이 "이미지가 있으면 오픈 / 없으면 準備中"의 근거가 된다:
//   - 폴더에 이미지를 넣고 배포 → 다음 빌드에서 자동으로 덱이 열림
//   - 폴더를 지우면 → 자동으로 準備中으로 닫힘
//   - 코드 수정 없음. jpg/jpeg/png/webp 모두 인식.
//
// package.json 에 아래 두 줄을 추가해 dev/build 전에 항상 실행되게 한다:
//   "predev":   "node scripts/generate-deck-manifest.mjs",
//   "prebuild": "node scripts/generate-deck-manifest.mjs",
//
// ⚠️ Vercel 서버리스 함수는 런타임에 public/ 폴더를 fs로 읽을 수 없기 때문에
//    (정적 파일은 CDN으로 분리됨) 이렇게 "빌드 시점 스캔 → JSON import" 방식을 쓴다.

import { readdirSync, statSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, 'public', 'tarot-images');
const OUT = path.join(ROOT, 'src', 'data', 'deck-manifest.json');

const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const CARD_KEY_RE = /^[a-z0-9]{2,12}$/;   // ar00, waac, cuqu ...
const DECK_KEY_RE = /^[a-z0-9_-]{2,20}$/; // kappa, zashiki, bakeneko ...

/** @type {Record<string, { count: number, files: Record<string, string> }>} */
const decks = {};

if (existsSync(IMG_DIR)) {
  for (const entry of readdirSync(IMG_DIR)) {
    const dir = path.join(IMG_DIR, entry);
    let isDir = false;
    try { isDir = statSync(dir).isDirectory(); } catch { continue; }
    if (!isDir || !DECK_KEY_RE.test(entry)) continue;

    /** @type {Record<string, string>} */
    const files = {};
    for (const f of readdirSync(dir)) {
      const ext = path.extname(f).toLowerCase();
      const base = path.basename(f, path.extname(f)).toLowerCase();
      if (!EXTS.has(ext) || !CARD_KEY_RE.test(base)) continue;
      if (!files[base]) files[base] = f; // 같은 키에 확장자가 여럿이면 먼저 발견된 것 사용
    }
    const count = Object.keys(files).length;
    if (count > 0) decks[entry] = { count, files };
  }
}

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), decks }, null, 2) + '\n');

const summary = Object.entries(decks).map(([k, v]) => `${k}(${v.count}枚)`).join(', ') || '(레어 덱 없음)';
console.log(`[deck-manifest] 생성 완료 → ${path.relative(ROOT, OUT)} : ${summary}`);
