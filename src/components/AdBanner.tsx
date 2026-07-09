// src/components/AdBanner.tsx
// ホシドタロ — AdSense 배너 (승인 전엔 자동으로 자리만, 승인 후 env만 채우면 광고 노출)
//
// 사용 흐름:
//   1) 승인 전: NEXT_PUBLIC_ADSENSE_CLIENT 가 비어 있음 → 아무것도 안 그림(레이아웃만 예약)
//   2) 승인 후: .env.local + Vercel에 NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXX 넣고
//              슬롯 ID를 <AdBanner slot="1234567890" /> 로 전달 → 실제 광고 노출
//
// 정책 반영(조사 근거):
//   - 광고와 콘텐츠 사이 간격 확보(의도치 않은 클릭 방지) → 상하 여백 my-6
//   - "광고" 라벨 명시 허용 표기만 사용("스폰서 링크"/"광고"는 OK, "인기 상품" 등은 금지)
//   - 콘텐츠 없는 화면/로딩 단독 화면에는 배치하지 말 것(호출부에서 판단)

'use client';

import { useEffect, useRef } from 'react';

type AdBannerProps = {
  /** AdSense 광고 단위 슬롯 ID (승인 후 대시보드에서 발급) */
  slot: string;
  /** 'auto'(반응형) | 'rectangle'(336x280 고정, CTR 높음) 등 */
  format?: string;
  /** 반응형 폭 채움 여부 */
  responsive?: boolean;
  /** 상단 라벨 표시 (기본 표시 권장) */
  showLabel?: boolean;
  className?: string;
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  showLabel = true,
  className = '',
}: AdBannerProps) {
  const pushed = useRef(false);

  useEffect(() => {
    // 승인 전(클라이언트 ID 없음) → 광고 로직 자체를 건너뜀
    if (!ADSENSE_CLIENT) return;
    if (pushed.current) return; // React StrictMode 이중 실행 방지
    try {
      // @ts-expect-error adsbygoogle는 외부 스크립트가 주입
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* 광고 차단기 등으로 실패해도 UI는 정상 유지 */
    }
  }, [slot]);

  // ── 승인 전: 개발 중 자리만 예약(배포 시엔 빈 공간) ──
  if (!ADSENSE_CLIENT) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div
          className={`my-6 flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-indigo-300/40 text-xs text-indigo-300/60 ${className}`}
          aria-hidden="true"
        >
          広告スペース（審査通過後に表示）
        </div>
      );
    }
    return null; // 프로덕션에서 승인 전이면 아무것도 안 보이게
  }

  // ── 승인 후: 실제 광고 ──
  return (
    <div className={`my-6 w-full text-center ${className}`}>
      {showLabel && (
        <div className="mb-1 text-[10px] uppercase tracking-widest text-white/30">
          広告
        </div>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
