// src/components/ShareResultImage.tsx
// ホシドタロ — 결과 공유 이미지 (클라이언트 Canvas 합성, 서버 비용 $0)
//
// [fortune] 왼쪽부터 過去・現在・未来 3장의 타로 카드를 나란히 →
//           아래에 AI 한줄평(conclusion) → 그 아래 AI 설명(summary)
// [decision] 카드 1장 + 판정 + AI 조언
//
// ⚠️ 설계 원칙: DB의 고정 카드 해설은 절대 포함하지 않는다.
//   포함하는 것은 (1) 타로 카드 이미지, (2) AI 생성 텍스트뿐.
'use client';

import { useState } from 'react';

type Orientation = 'upright' | 'reversed';

export type ShareCard = {
  imageUrl: string;
  name: string;
  orientation: Orientation;
  /** 過去 / 現在 / 未来 */
  position?: string;
};

type FortuneProps = {
  type: 'fortune';
  /** 왼쪽부터 과거→현재→미래 순으로 최대 3장 */
  cards: ShareCard[];
  /** AI 한줄평 (result.conclusion) */
  conclusion?: string;
  /** AI 설명 (result.summary) */
  summary?: string;
  className?: string;
};

type DecisionProps = {
  type: 'decision';
  card: ShareCard;
  verdict: 'する' | 'しない' | 'どちらでも';
  /** AI 조언 (result.advice) */
  aiText: string;
  className?: string;
};

type Props = FortuneProps | DecisionProps;

const CANVAS_W = 1080;
const CANVAS_H = 1350; // 4:5, SNS 피드 최적

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 6
): number {
  // 일본어는 공백 단위 분리가 안 되므로 글자 단위로 줄바꿈
  const chars = Array.from(text);
  let line = '';
  let lines: string[] = [];
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…';
  }
  lines.forEach((l, i) => ctx.fillText(l, centerX, y + i * lineHeight));
  return lines.length * lineHeight;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createRadialGradient(CANVAS_W / 2, 0, 0, CANVAS_W / 2, 0, CANVAS_H * 0.9);
  grad.addColorStop(0, '#2A2D6B');
  grad.addColorStop(0.45, '#1E2050');
  grad.addColorStop(1, '#14152B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = '#F5E6A8';
  const stars: [number, number][] = [
    [90, 120], [960, 90], [140, 1180], [980, 1240], [520, 60], [70, 760], [1010, 820],
  ];
  for (const [sx, sy] of stars) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawHeader(ctx: CanvasRenderingContext2D, subtitle: string) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#C9A227';
  ctx.font = '600 30px "Noto Sans JP", sans-serif';
  ctx.fillText('ホシドタロ', CANVAS_W / 2, 92);
  ctx.font = '400 20px "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#8B8DBC';
  ctx.fillText(subtitle, CANVAS_W / 2, 126);
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6B6D9E';
  ctx.font = '400 20px "Noto Sans JP", sans-serif';
  ctx.fillText('ホシドタロで今日の運勢を占う', CANVAS_W / 2, CANVAS_H - 50);
}

async function drawCard(
  ctx: CanvasRenderingContext2D,
  card: ShareCard,
  x: number,
  y: number,
  w: number,
  h: number
) {
  try {
    const img = await loadImage(card.imageUrl);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 24;
    ctx.strokeStyle = 'rgba(201,162,39,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
    if (card.orientation === 'reversed') {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
    ctx.restore();
    ctx.shadowBlur = 0;
  } catch {
    // 이미지 로드 실패(CORS 등) → 프레임+이름 폴백 (전체 실패 방지)
    ctx.fillStyle = '#2A2D6B';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(201,162,39,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#C9A227';
    ctx.font = '500 22px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(card.name, x + w / 2, y + h / 2);
  }
}

// ── fortune: 3장 나란히(過去・現在・未来) + 한줄평 + 설명 ──
async function composeFortune(p: FortuneProps): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  drawBackground(ctx);
  drawHeader(ctx, '今日の運勢');

  // 카드 3장: 좌→우 = 과거→현재→미래. 폭 300, 간격 45
  const cards = p.cards.slice(0, 3);
  const cardW = 300;
  const cardH = Math.round((cardW * 5) / 3); // 500 (3:5)
  const gap = 45;
  const totalW = cards.length * cardW + (cards.length - 1) * gap;
  const startX = (CANVAS_W - totalW) / 2;
  const labelY = 186;
  const cardY = 210;
  const defaultPositions = ['過去', '現在', '未来'];

  for (let i = 0; i < cards.length; i++) {
    const x = startX + i * (cardW + gap);
    const c = cards[i];
    // 포지션 라벨 (카드 위)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C9A227';
    ctx.font = '500 24px "Noto Sans JP", sans-serif';
    ctx.fillText(c.position ?? defaultPositions[i] ?? '', x + cardW / 2, labelY);
    // 카드
    await drawCard(ctx, c, x, cardY, cardW, cardH);
    // 카드명 + 정역 (카드 아래, 길면 축약)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#D8D5EE';
    ctx.font = '400 20px "Noto Sans JP", sans-serif';
    let nameLine = `${c.name}（${c.orientation === 'upright' ? '正' : '逆'}）`;
    while (ctx.measureText(nameLine).width > cardW + 20 && nameLine.length > 6) {
      nameLine = nameLine.slice(0, -4) + '…）';
    }
    ctx.fillText(nameLine, x + cardW / 2, cardY + cardH + 36);
  }

  let y = cardY + cardH + 100; // ≈ 810

  // AI 한줄평 (conclusion) — 크게
  if (p.conclusion) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F6F1E4';
    ctx.font = '600 40px "Shippori Mincho", "Noto Sans JP", serif';
    const used = wrapText(ctx, p.conclusion, CANVAS_W / 2, y, CANVAS_W - 160, 54, 2);
    y += used + 18;

    // 별 구분선
    ctx.strokeStyle = 'rgba(201,162,39,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2 - 180, y);
    ctx.lineTo(CANVAS_W / 2 - 30, y);
    ctx.moveTo(CANVAS_W / 2 + 30, y);
    ctx.lineTo(CANVAS_W / 2 + 180, y);
    ctx.stroke();
    ctx.fillStyle = '#C9A227';
    ctx.font = '400 20px "Noto Sans JP", sans-serif';
    ctx.fillText('✦', CANVAS_W / 2, y + 7);
    y += 52;
  }

  // AI 설명 (summary)
  if (p.summary) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E4E1F2';
    ctx.font = '400 27px "Noto Sans JP", sans-serif';
    wrapText(ctx, p.summary, CANVAS_W / 2, y, CANVAS_W - 180, 42, 8);
  }

  drawFooter(ctx);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95));
}

// ── decision: 카드 1장 + 판정 + AI 조언 ──
async function composeDecision(p: DecisionProps): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  drawBackground(ctx);
  drawHeader(ctx, 'する・しない占い');

  const cardW = 360;
  const cardH = Math.round((cardW * 5) / 3); // 600
  const cardX = (CANVAS_W - cardW) / 2;
  const cardY = 180;
  await drawCard(ctx, p.card, cardX, cardY, cardW, cardH);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#D8D5EE';
  ctx.font = '400 22px "Noto Sans JP", sans-serif';
  ctx.fillText(
    `${p.card.name}（${p.card.orientation === 'upright' ? '正位置' : '逆位置'}）`,
    CANVAS_W / 2,
    cardY + cardH + 44
  );

  // 판정
  const badgeColor =
    p.verdict === 'する' ? '#4ADE80' : p.verdict === 'しない' ? '#F87171' : '#C9A227';
  ctx.fillStyle = badgeColor;
  ctx.font = '700 72px "Shippori Mincho", "Noto Sans JP", serif';
  ctx.fillText(p.verdict, CANVAS_W / 2, cardY + cardH + 146);

  // AI 조언
  if (p.aiText) {
    ctx.fillStyle = '#E4E1F2';
    ctx.font = '400 28px "Noto Sans JP", sans-serif';
    wrapText(ctx, p.aiText, CANVAS_W / 2, cardY + cardH + 216, CANVAS_W - 180, 44, 6);
  }

  drawFooter(ctx);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95));
}

export default function ShareResultImage(props: Props) {
  const [busy, setBusy] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob =
        props.type === 'fortune' ? await composeFortune(props) : await composeDecision(props);
      if (!blob) throw new Error('canvas failed');
      const file = new File([blob], 'hoshidotaro-result.png', { type: 'image/png' });

      const nav = navigator as any;
      if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: 'ホシドタロ',
            text:
              props.type === 'fortune'
                ? '今日の運勢を占ってもらいました✨'
                : '「する・しない」を占ってもらいました✨',
          });
          return;
        } catch (err: any) {
          if (err?.name === 'AbortError') return; // 사용자가 시트를 닫음
        }
      }

      // 파일 공유 미지원(데스크톱 등) → 다운로드 폴백
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hoshidotaro-result.png';
      a.click();
      URL.revokeObjectURL(url);
      setSavedNote(true);
    } catch (e) {
      console.error('share image failed', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={props.className}>
      <button
        onClick={handleShare}
        disabled={busy}
        className="w-full rounded-xl bg-[#C9A227] py-3 text-[14px] font-semibold text-[#14152B] disabled:opacity-60"
      >
        {busy ? '画像を作成中…' : '📤 結果を画像でシェア'}
      </button>
      {savedNote && (
        <p className="mt-2 text-center text-[11px] text-[#8B8DBC]">
          画像を保存しました。SNSアプリを開いて共有してください。
        </p>
      )}
    </div>
  );
}
