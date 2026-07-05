// src/app/(flow)/layout.tsx
'use client';

import { FortuneProvider } from '@/lib/fortune-context';

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return <FortuneProvider>{children}</FortuneProvider>;
}
