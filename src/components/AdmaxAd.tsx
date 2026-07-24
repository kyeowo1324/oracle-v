// src/components/AdmaxAd.tsx
// 忍者AdMax 광고 컴포넌트
//
// ─────────────────────────────────────────────────────────────
// 왜 이렇게 복잡하게 만들었나 (중요)
// ─────────────────────────────────────────────────────────────
// 忍者AdMax가 주는 태그는 이런 형태다.
//     <script src="https://adm.shinobi.jp/s/ID"></script>
//
// 이건 "스크립트가 놓인 그 자리에 광고를 써넣는" 옛날 방식(document.write)이다.
// 그래서 React/Next.js에서 그냥 붙이면 두 가지가 망가진다.
//
//  ① next/script의 <Script>는 JSX에 쓴 위치에 렌더링되지 않는다.
//     문서 끝에 따로 주입되므로, 감싼 <div>는 영원히 비어 있다.
//
//  ② document.write는 "페이지를 다 읽은 뒤"에 실행되면
//     문서 전체를 지우고 새로 쓴다. 즉 사이트가 통째로 사라진다.
//     (strategy="lazyOnload" 는 바로 이 위험한 타이밍이다)
//
// 해결: 광고를 iframe 안에서 실행시킨다.
//   iframe은 자기만의 문서를 갖기 때문에
//   - document.write가 iframe 안에서만 일어나 부모 페이지가 안전하고
//   - 스크립트가 파싱 중에 실행되므로 원래 의도대로 광고가 그려지며
//   - 페이지를 이동해도(SPA) 매번 새 iframe이 만들어져 광고가 다시 뜬다.
//   - 한 페이지에 여러 개를 놓아도 서로 간섭하지 않는다.
//
// ─────────────────────────────────────────────────────────────
'use client';

import { useEffect, useState } from 'react';
import { ADMAX, ADMAX_ENABLED, ADMAX_SIZE } from '@/lib/ads';

type Props = {
  /** 광고 아래위 여백 등 조정용 */
  className?: string;
  /** 「スポンサーリンク」 라벨 표시 여부 (기본 표시) */
  showLabel?: boolean;
};

/** PC/스마트폰 판정 기준 폭 */
const MOBILE_BREAKPOINT = 768;

export default function AdmaxAd({ className = '', showLabel = true }: Props) {
  // null = 아직 화면 크기를 모름(서버 렌더링 시점)
  // 서버와 클라이언트가 다른 걸 그리면 경고가 나므로, 확정 전에는 자리만 잡는다.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 광고를 꺼둔 상태(심사 중 등)에는 아무것도 그리지 않는다.
  if (!ADMAX_ENABLED) return null;

  const id = isMobile ? ADMAX.sp : ADMAX.pc;
  const size = isMobile ? ADMAX_SIZE.sp : ADMAX_SIZE.pc;

  // ID를 아직 안 넣었으면(초기 상태) 아무것도 안 그린다.
  if (!id || id.length < 8) return null;

  // 화면 크기 판정 전에는 높이만 확보해 둔다(광고가 뜰 때 화면이 덜컥 밀리는 것 방지)
  if (isMobile === null) {
    return (
      <div
        className={`my-6 w-full ${className}`}
        style={{ minHeight: ADMAX_SIZE.sp.height }}
        aria-hidden="true"
      />
    );
  }

  // iframe 안에서 원래 태그를 그대로 실행시킨다.
  // 스크립트가 문서 파싱 중에 돌기 때문에 document.write가 정상 동작한다.
  const srcDoc = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>
</head><body>
<script src="https://adm.shinobi.jp/s/${id}"><\/script>
</body></html>`;

  return (
    <div className={`my-6 flex w-full flex-col items-center ${className}`}>
      {showLabel && (
        <span className="mb-1 text-[10px] tracking-wider text-[#5D5F91]">
          スポンサーリンク
        </span>
      )}
      <iframe
        // key에 id를 넣어 PC↔모바일 전환 시 iframe이 새로 만들어지게 한다
        key={id}
        title="広告"
        srcDoc={srcDoc}
        width={size.width}
        height={size.height}
        scrolling="no"
        frameBorder={0}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{
          width: size.width,
          height: size.height,
          border: 'none',
          display: 'block',
          maxWidth: '100%',
        }}
        loading="lazy"
      />
    </div>
  );
}
