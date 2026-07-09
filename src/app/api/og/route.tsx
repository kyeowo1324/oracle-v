// src/app/api/og/route.tsx
// ホシドタロ — 링크 공유용 동적 OG 이미지 (Edge Function, Vercel 무료 티어)
//
// 완전 stateless: DB 저장 없이 쿼리 파라미터만으로 그 자리에서 이미지를 그린다.
// searchParams.get()이 URL 디코딩을 이미 수행하므로 추가 디코딩 불필요.

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// 외부인이 임의 이미지 URL을 넣어 피싱 이미지를 만들지 못하도록,
// 카드 이미지는 우리 사이트/저장소 경로만 허용
function isAllowedImage(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true; // 자체 정적 경로
  try {
    const u = new URL(url);
    const allowedHosts = [
      new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoshidotaro.vercel.app').host,
    ];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) allowedHosts.push(new URL(supabaseUrl).host);
    return u.protocol === 'https:' && allowedHosts.includes(u.host);
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get('type') === 'decision' ? 'decision' : 'fortune';
  const card = (searchParams.get('card') ?? '').slice(0, 30);
  const orientation = searchParams.get('orientation') === 'reversed' ? 'reversed' : 'upright';
  const rawImage = searchParams.get('image') ?? '';
  const text = (searchParams.get('text') ?? '').slice(0, 90);
  const verdictRaw = searchParams.get('verdict') ?? '';
  const verdict = ['する', 'しない', 'どちらでも'].includes(verdictRaw) ? verdictRaw : '';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hoshidotaro.vercel.app';
  const image = isAllowedImage(rawImage)
    ? rawImage.startsWith('/')
      ? `${siteUrl}${rawImage}`
      : rawImage
    : '';

  const verdictColor =
    verdict === 'する' ? '#4ADE80' : verdict === 'しない' ? '#F87171' : '#C9A227';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background: 'linear-gradient(135deg, #2A2D6B 0%, #1E2050 45%, #14152B 100%)',
        }}
      >
        {/* 왼쪽: 텍스트 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '680px',
            padding: '60px',
          }}
        >
          <div style={{ display: 'flex', color: '#C9A227', fontSize: 44, fontWeight: 700 }}>
            ホシドタロ
          </div>
          <div style={{ display: 'flex', color: '#8B8DBC', fontSize: 24, marginTop: 8 }}>
            {type === 'fortune' ? '今日の運勢' : 'する・しない占い'}
          </div>

          {verdict && (
            <div
              style={{
                display: 'flex',
                marginTop: 28,
                color: verdictColor,
                fontSize: 56,
                fontWeight: 700,
              }}
            >
              {verdict}
            </div>
          )}

          {text && (
            <div
              style={{
                display: 'flex',
                marginTop: 24,
                color: '#F6F1E4',
                fontSize: 30,
                lineHeight: 1.5,
                maxWidth: '580px',
              }}
            >
              {text}
            </div>
          )}

          <div style={{ display: 'flex', marginTop: 36, color: '#6B6D9E', fontSize: 20 }}>
            タップして詳しく見る →
          </div>
        </div>

        {/* 오른쪽: 타로 카드 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '520px',
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              width={260}
              height={433}
              style={{
                borderRadius: '12px',
                border: '3px solid rgba(201,162,39,0.5)',
                transform: orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '260px',
                height: '433px',
                borderRadius: '12px',
                border: '3px solid rgba(201,162,39,0.5)',
                background: '#1A1B3A',
                color: '#C9A227',
                fontSize: 28,
              }}
            >
              {card || '🔮'}
            </div>
          )}
          {card && image && (
            <div style={{ display: 'flex', marginTop: 16, color: '#F6F1E4', fontSize: 22 }}>
              {card}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
