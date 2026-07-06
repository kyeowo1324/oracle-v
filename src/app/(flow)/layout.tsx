// src/app/(flow)/layout.tsx
// (flow) 그룹: 입력 단계(flow/*)에서 Context를 쓰므로 Provider 유지.
// 결과 페이지는 sessionStorage만 쓰도록 바꿨으므로 (flow) 밖에 있어도 크래시하지 않음.
'use client';

import { FortuneProvider } from '@/lib/fortune-context';

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return <FortuneProvider>{children}</FortuneProvider>;
}
