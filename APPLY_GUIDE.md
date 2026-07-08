# Vercel Analytics 적용

## 파일 배치
| 파일 | 동작 |
|---|---|
| `package.json` | 덮어쓰기 — @vercel/analytics 추가됨 |
| `package-lock.json` | 덮어쓰기 |
| `src/app/layout.tsx` | 덮어쓰기 — <Analytics /> 컴포넌트 추가 |

## 적용
```bash
npm install
git add -A && git commit -m "Add Vercel Analytics"
git push
```
Vercel이 자동 재배포합니다. 배포 후 사이트를 몇 페이지 넘겨보고
30초 뒤 Vercel 대시보드 → Analytics 탭에서 데이터 확인.
