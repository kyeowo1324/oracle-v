// src/app/result/layout.tsx
// 결과 화면은 사용자의 입력(sessionStorage)이 있어야 내용이 만들어진다.
// 검색엔진이 직접 방문하면 빈 화면만 보이므로 색인에서 제외한다.
// (robots.txt의 disallow와 함께 이중으로 막는다)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
