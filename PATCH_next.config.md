// ============================================================
// PATCH_next.config.md — S-5. 보안 헤더 추가
// ============================================================
//
// 프로젝트 루트의 next.config.ts (또는 next.config.mjs / next.config.js)를 열어
// config 객체 안에 아래 `headers()` 함수를 추가하세요.
//
// 효과:
//   - X-Content-Type-Options: 업로드/응답의 MIME 스니핑 차단
//   - X-Frame-Options: 타 사이트가 iframe으로 감싸는 클릭재킹 차단
//   - Referrer-Policy: 외부 이동 시 전체 URL(공유 파라미터 등) 유출 방지
//   - Permissions-Policy: 쓰지 않는 카메라/마이크/위치 권한 원천 차단
//
// ※ CSP(Content-Security-Policy)는 의도적으로 제외했습니다.
//   AdSense/Analytics가 동적으로 스크립트·iframe을 주입하기 때문에 CSP를 잘못 걸면
//   광고가 통째로 안 나옵니다. 광고 승인·게재가 안정된 뒤(B단계 이후)에
//   report-only 모드로 시작하는 것을 권장합니다.

// ── next.config.ts 예시 (기존 옵션은 유지하고 headers만 추가) ──

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ...기존 옵션 그대로...

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;

// ── next.config.mjs / .js 인 경우 ──
// 타입 import 없이 같은 headers() 블록을 export 객체에 추가하면 됩니다.
//
// 배포 후 확인:
//   curl -sI https://hoshidotaro.vercel.app | grep -iE 'x-frame|x-content|referrer|permissions'
