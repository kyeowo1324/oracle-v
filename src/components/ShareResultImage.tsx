// src/components/ShareResultImage.tsx
// ホシドタロ — 결과 공유 이미지 (클라이언트 Canvas 합성, 서버 비용 $0)
//
// ⚠️ 설계 원칙: DB의 고정 카드 해설은 절대 포함하지 않는다.
//   포함하는 것은 (1) 타로 카드 이미지, (2) AI 생성 텍스트
//   (fortune의 summary / decision의 advice) 뿐이다.
'use client';

import { useState } from 'react';

type Orientation = 'upright' | 'reversed';

type Props = {
  type: 'fortune' | 'decision';
  cardImageUrl: string;
  cardName: string;
  orientation: Orientation;
  /** AI가 생성한 텍스트만 전달할 것 (DB 고정 해설 금지) */
  aiText: string;
  /** decision 전용: する / しない / どちらでも */
  verdict?: 'する' | 'しない' | 'どちらでも';
  className?: string;
};

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
) {
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

async function composeImage(props: Props): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 배경: 브랜드 인디고 그라데이션
  const grad = ctx.createRadialGradient(CANVAS_W / 2, 0, 0, CANVAS_W / 2, 0, CANVAS_H * 0.9);
  grad.addColorStop(0, '#2A2D6B');
  grad.addColorStop(0.45, '#1E2050');
  grad.addColorStop(1, '#14152B');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // 잔잔한 별 점 (브랜드 일관성)
  ctx.fillStyle = '#F5E6A8';
  const stars: [number, number][] = [
    [90, 120], [960, 90], [140, 980], [980, 1040], [520, 60], [70, 560], [1010, 620],
  ];
  for (const [sx, sy] of stars) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 상단 워드마크
  ctx.textAlign = 'center';
  ctx.fillStyle = '#C9A227';
  ctx.font = '600 30px "Noto Sans JP", sans-serif';
  ctx.fillText('ホシドタロ', CANVAS_W / 2, 100);
  ctx.font = '400 20px "Noto Sans JP", sans-serif';
  ctx.fillStyle = '#8B8DBC';
  ctx.fillText(props.type === 'fortune' ? '今日の運勢' : 'する・しない占い', CANVAS_W / 2, 136);

  // 타로 카드 이미지 (역방향 180도 회전)
  const cardW = 380;
  const cardH = Math.round((cardW * 5) / 3); // 3:5
  const cardX = (CANVAS_W - cardW) / 2;
  const cardY = 190;

  try {
    const img = await loadImage(props.cardImageUrl);
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 30;
    ctx.strokeStyle = 'rgba(201,162,39,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(cardX - 2, cardY - 2, cardW + 4, cardH + 4);
    if (props.orientation === 'reversed') {
      ctx.translate(cardX + cardW / 2, cardY + cardH / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
    } else {
      ctx.drawImage(img, cardX, cardY, cardW, cardH);
    }
    ctx.restore();
    ctx.shadowBlur = 0;
  } catch {
    // 이미지 로드 실패(CORS 등) 시 카드 프레임+이름만으로 진행 (전체 실패 방지)
    ctx.fillStyle = '#2A2D6B';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = 'rgba(201,162,39,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(cardX, cardY, cardW, cardH);
    ctx.fillStyle = '#C9A227';
    ctx.font = '500 30px "Noto Sans JP", sans-serif';
    ctx.fillText(props.cardName, CANVAS_W / 2, cardY + cardH / 2);
  }

  // 카드명
  ctx.fillStyle = '#F6F1E4';
  ctx.font = '500 24px "Noto Sans JP", sans-serif';
  ctx.fillText(
    `${props.cardName}（${props.orientation === 'upright' ? '正位置' : '逆位置'}）`,
    CANVAS_W / 2,
    cardY + cardH + 50
  );

  // decision 판정 배지
  let textY = cardY + cardH + 110;
  if (props.type === 'decision' && props.verdict) {
    const badgeColor =
      props.verdict === 'する' ? '#4ADE80' : props.verdict === 'しない' ? '#F87171' : '#C9A227';
    ctx.fillStyle = badgeColor;
    ctx.font = '700 44px "Noto Sans JP", sans-serif';
    ctx.fillText(props.verdict, CANVAS_W / 2, textY);
    textY += 60;
  }

  // AI 생성 텍스트만 (DB 고정 해설 절대 미포함)
  ctx.fillStyle = '#F6F1E4';
  ctx.font = '400 30px "Noto Sans JP", sans-serif';
  wrapText(ctx, props.aiText, CANVAS_W / 2, textY, CANVAS_W - 200, 44, 6);

  // 하단 안내
  ctx.fillStyle = '#6B6D9E';
  ctx.font = '400 20px "Noto Sans JP", sans-serif';
  ctx.fillText('ホシドタロで今日の運勢を占う', CANVAS_W / 2, CANVAS_H - 60);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95));
}

export default function ShareResultImage(props: Props) {
  const [busy, setBusy] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await composeImage(props);
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
          // 사용자가 공유 시트를 닫은 경우(AbortError)는 조용히 종료
          if (err?.name === 'AbortError') return;
          // 그 외 실패는 다운로드 폴백으로 진행
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
