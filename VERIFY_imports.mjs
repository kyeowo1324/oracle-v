// VERIFY_imports.mjs — 배포 전 import 누락 사전 점검
// 사용법: 프로젝트 루트에서  node VERIFY_imports.mjs
// src 전체의 @/ import를 스캔해, 실제 파일이 없는 import를 찾아준다.
// (지금까지 반복된 "module not found" 빌드 에러를 배포 전에 잡기 위한 도구)
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const exts = ['.ts', '.tsx', '.js', '.jsx', '.json'];

function walk(dir) {
  let files = [];
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) files = files.concat(walk(p));
    else if (/\.(ts|tsx|js|jsx)$/.test(e)) files.push(p);
  }
  return files;
}

function resolves(spec) {
  // @/x → src/x
  const rel = spec.replace(/^@\//, '');
  const base = path.join(SRC, rel);
  if (existsSync(base) && statSync(base).isFile()) return true;
  for (const ext of exts) if (existsSync(base + ext)) return true;
  // 디렉토리 index
  for (const ext of exts) if (existsSync(path.join(base, 'index' + ext))) return true;
  return false;
}

if (!existsSync(SRC)) { console.error('src/ 없음. 프로젝트 루트에서 실행하세요.'); process.exit(1); }

const missing = [];
for (const f of walk(SRC)) {
  const txt = readFileSync(f, 'utf8');
  const re = /from\s+['"](@\/[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(txt))) {
    if (!resolves(m[1])) missing.push({ file: path.relative(ROOT, f), spec: m[1] });
  }
}

if (missing.length === 0) {
  console.log('✅ 모든 @/ import가 실제 파일로 해결됩니다. 빌드 안전.');
} else {
  console.log('❌ 다음 import의 파일이 없습니다 (빌드가 깨집니다):\n');
  for (const x of missing) console.log(`  ${x.file}\n    → ${x.spec}  (파일 없음)`);
  console.log('\n해당 파일을 추가하거나, 그 import를 제거하세요.');
  process.exit(1);
}
