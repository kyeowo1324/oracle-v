// src/components/ShareResultImage.tsx
// ホシドタロ — 결과 공유 이미지 (클라이언트 Canvas 합성, 서버 비용 $0)
//
// [fortune] 왼쪽부터 過去・現在・未来 3장의 타로 카드를 나란히 →
//           아래에 AI 한줄평(conclusion) → 그 아래 AI 설명(summary)
// [decision] 카드 1장 + 판정 + AI 조언
//
// ⚠️ 설계 원칙: DB의 고정 카드 해설은 절대 포함하지 않는다.
//   포함하는 것은 (1) 타로 카드 이미지, (2) AI 생성 텍스트뿐.
//
// ── 공유 점검판 (v2) — "복사가 안 된다" 문제 수정 ──
//  문제 1) 복사 경로 자체가 없었음: 셰어→실패 시 조용한 다운로드뿐.
//          LINE·Instagram 인앱 브라우저(일본 주 유입 경로)에서는 navigator.share(파일)도
//          a.click() blob 다운로드도 막혀 있어 "눌러도 아무 일도 안 일어남"이 됨.
//  문제 2) iOS Safari는 클릭 후 캔버스 합성(이미지 3장 로드)을 기다리는 동안
//          사용자 제스처가 만료되어 share()가 NotAllowedError로 죽는 경우가 있음.
//  문제 3) 캔버스 폰트: next/font는 "Shippori Mincho" 같은 원래 이름이 아니라
//          내부 해시 이름으로 폰트를 등록하므로, 리터럴 이름 지정은 전부 기본
//          폰트로 폴백되고 있었음 (공유 이미지의 명조체가 안 먹던 원인).
//
//  해결:
//   ① 「画像をコピー」 버튼 신설 — ClipboardItem에 Promise<Blob>을 "클릭 핸들러 안에서
//      동기적으로" 넣는 Safari 호환 패턴. 합성이 끝나기 전에 제스처가 만료돼도 통과.
//   ② 모든 실패 경로의 최종 폴백 = 미리보기 모달(<img> 길게 누르기 저장/복사).
//      인앱 브라우저에서도 <img> 롱프레스는 항상 동작하는 유일한 경로.
//   ③ 합성 결과를 ref에 캐시 — 두 번째 시도부터는 제스처 안에서 즉시 share/copy.
//   ④ 폰트는 CSS 변수(--font-serif-jp/--font-sans-jp)에서 실제 등록 이름을 읽어 사용
//      + document.fonts.ready 대기.
'use client';

import { useEffect, useRef, useState } from 'react';

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

// ── 폰트 해석: next/font가 등록한 실제 패밀리명을 CSS 변수에서 읽는다 ──
// layout.tsx가 <html>에 --font-serif-jp / --font-sans-jp 를 세팅해 둠.
// 변수가 없으면(예: 테스트 환경) 리터럴 이름 + 시스템 폴백으로 동작.
type CanvasFonts = { serif: string; sans: string };
function getCanvasFonts(): CanvasFonts {
  const pick = (varName: string, fallback: string) => {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return v ? `${v}, ${fallback}` : fallback;
    } catch {
      return fallback;
    }
  };
  return {
    serif: pick('--font-serif-jp', '"Shippori Mincho", "Noto Sans JP", serif'),
    sans: pick('--font-sans-jp', '"Noto Sans JP", sans-serif'),
  };
}

// 그리지 않고 필요한 줄 수만 계산 (적응형 폰트 크기 결정용)
function measureLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): number {
  const chars = Array.from(text);
  let line = '';
  let count = 0;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      count++;
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) count++;
  return count;
}

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

function drawHeader(ctx: CanvasRenderingContext2D, subtitle: string, f: CanvasFonts) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#C9A227';
  ctx.font = `600 30px ${f.sans}`;
  ctx.fillText('ホシドタロ', CANVAS_W / 2, 92);
  ctx.font = `400 20px ${f.sans}`;
  ctx.fillStyle = '#8B8DBC';
  ctx.fillText(subtitle, CANVAS_W / 2, 126);
}

function drawFooter(ctx: CanvasRenderingContext2D, f: CanvasFonts) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6B6D9E';
  ctx.font = `400 20px ${f.sans}`;
  ctx.fillText('ホシドタロで今日の運勢を占う', CANVAS_W / 2, CANVAS_H - 50);
}

async function drawCard(
  ctx: CanvasRenderingContext2D,
  card: ShareCard,
  x: number,
  y: number,
  w: number,
  h: number,
  f: CanvasFonts
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
    ctx.font = `500 22px ${f.sans}`;
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

  // 웹폰트가 로드된 뒤에 그려야 명조체가 캔버스에 반영됨
  try { await (document as any).fonts?.ready; } catch { /* noop */ }
  const f = getCanvasFonts();

  drawBackground(ctx);
  drawHeader(ctx, '今日の運勢', f);

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
    ctx.font = `500 24px ${f.sans}`;
    ctx.fillText(c.position ?? defaultPositions[i] ?? '', x + cardW / 2, labelY);
    // 카드
    await drawCard(ctx, c, x, cardY, cardW, cardH, f);
    // 카드명 + 정역 (카드 아래, 길면 축약)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#D8D5EE';
    ctx.font = `400 20px ${f.sans}`;
    let nameLine = `${c.name}（${c.orientation === 'upright' ? '正' : '逆'}）`;
    while (ctx.measureText(nameLine).width > cardW + 20 && nameLine.length > 6) {
      nameLine = nameLine.slice(0, -4) + '…）';
    }
    ctx.fillText(nameLine, x + cardW / 2, cardY + cardH + 36);
  }

  let y = cardY + cardH + 100; // ≈ 810
  const bottomLimit = CANVAS_H - 100; // 푸터 위 여백 확보

  // AI 한줄평 (conclusion) — 적응형: 길면 폰트를 줄여 전문 표시 (잘림 방지)
  if (p.conclusion) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F6F1E4';
    const concWidth = CANVAS_W - 160;
    const concConfigs = [
      { size: 40, lh: 54, max: 2 },
      { size: 34, lh: 47, max: 3 },
      { size: 30, lh: 42, max: 3 },
      { size: 27, lh: 38, max: 4 },
    ];
    let chosen = concConfigs[concConfigs.length - 1];
    for (const cfg of concConfigs) {
      ctx.font = `600 ${cfg.size}px ${f.serif}`;
      if (measureLines(ctx, p.conclusion, concWidth) <= cfg.max) {
        chosen = cfg;
        break;
      }
    }
    ctx.font = `600 ${chosen.size}px ${f.serif}`;
    const used = wrapText(ctx, p.conclusion, CANVAS_W / 2, y, concWidth, chosen.lh, chosen.max);
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
    ctx.font = `400 20px ${f.sans}`;
    ctx.fillText('✦', CANVAS_W / 2, y + 7);
    y += 52;
  }

  // AI 설명 (summary) — 적응형: 남은 세로 공간에 전문이 들어가도록 폰트 자동 축소
  if (p.summary) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E4E1F2';
    const sumWidth = CANVAS_W - 180;
    const remaining = bottomLimit - y;
    const sumConfigs = [
      { size: 27, lh: 42 },
      { size: 25, lh: 38 },
      { size: 23, lh: 35 },
      { size: 21, lh: 32 },
    ];
    let picked = sumConfigs[sumConfigs.length - 1];
    for (const cfg of sumConfigs) {
      ctx.font = `400 ${cfg.size}px ${f.sans}`;
      const need = measureLines(ctx, p.summary, sumWidth) * cfg.lh;
      if (need <= remaining) {
        picked = cfg;
        break;
      }
    }
    ctx.font = `400 ${picked.size}px ${f.sans}`;
    const capacity = Math.max(3, Math.floor(remaining / picked.lh));
    wrapText(ctx, p.summary, CANVAS_W / 2, y, sumWidth, picked.lh, capacity);
  }

  drawFooter(ctx, f);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95));
}

// ── decision: 카드 1장 + 판정 + AI 조언 ──
async function composeDecision(p: DecisionProps): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  try { await (document as any).fonts?.ready; } catch { /* noop */ }
  const f = getCanvasFonts();

  drawBackground(ctx);
  drawHeader(ctx, 'する・しない占い', f);

  const cardW = 360;
  const cardH = Math.round((cardW * 5) / 3); // 600
  const cardX = (CANVAS_W - cardW) / 2;
  const cardY = 180;
  await drawCard(ctx, p.card, cardX, cardY, cardW, cardH, f);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#D8D5EE';
  ctx.font = `400 22px ${f.sans}`;
  ctx.fillText(
    `${p.card.name}（${p.card.orientation === 'upright' ? '正位置' : '逆位置'}）`,
    CANVAS_W / 2,
    cardY + cardH + 44
  );

  // 판정
  const badgeColor =
    p.verdict === 'する' ? '#4ADE80' : p.verdict === 'しない' ? '#F87171' : '#C9A227';
  ctx.fillStyle = badgeColor;
  ctx.font = `700 72px ${f.serif}`;
  ctx.fillText(p.verdict, CANVAS_W / 2, cardY + cardH + 146);

  // AI 조언 — 적응형 (잘림 방지)
  if (p.aiText) {
    ctx.fillStyle = '#E4E1F2';
    const advWidth = CANVAS_W - 180;
    const advY = cardY + cardH + 216;
    const remaining = CANVAS_H - 100 - advY;
    const advConfigs = [
      { size: 28, lh: 44 },
      { size: 25, lh: 39 },
      { size: 22, lh: 34 },
    ];
    let picked = advConfigs[advConfigs.length - 1];
    for (const cfg of advConfigs) {
      ctx.font = `400 ${cfg.size}px ${f.sans}`;
      if (measureLines(ctx, p.aiText, advWidth) * cfg.lh <= remaining) {
        picked = cfg;
        break;
      }
    }
    ctx.font = `400 ${picked.size}px ${f.sans}`;
    const capacity = Math.max(3, Math.floor(remaining / picked.lh));
    wrapText(ctx, p.aiText, CANVAS_W / 2, advY, advWidth, picked.lh, capacity);
  }

  drawFooter(ctx, f);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.95));
}

export default function ShareResultImage(props: Props) {
  const [busy, setBusy] = useState<null | 'share' | 'copy'>(null);
  const [note, setNote] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // 미리보기 모달 (blob URL)
  const [canCopy, setCanCopy] = useState(false);
  // 합성 결과 캐시: 같은 결과 화면에서는 1회만 그린다.
  // 재시도 시 제스처 안에서 즉시 share/copy 가능해져 iOS 제스처 만료 문제도 완화.
  const cacheRef = useRef<{ blob: Blob; url: string } | null>(null);

  useEffect(() => {
    // hydration mismatch 방지를 위해 마운트 후 기능 감지
    setCanCopy(
      typeof window !== 'undefined' &&
        typeof (window as any).ClipboardItem !== 'undefined' &&
        !!navigator.clipboard &&
        typeof (navigator.clipboard as any).write === 'function'
    );
    const cached = cacheRef.current;
    return () => {
      if (cached) URL.revokeObjectURL(cached.url);
    };
  }, []);

  const getBlob = async (): Promise<Blob> => {
    if (cacheRef.current) return cacheRef.current.blob;
    const blob =
      props.type === 'fortune' ? await composeFortune(props) : await composeDecision(props);
    if (!blob) throw new Error('canvas failed');
    cacheRef.current = { blob, url: URL.createObjectURL(blob) };
    return blob;
  };
  const getUrl = async (): Promise<string> => {
    await getBlob();
    return cacheRef.current!.url;
  };

  const flash = (msg: string) => {
    setNote(msg);
    setTimeout(() => setNote(null), 2600);
  };

  // ── 📤 셰어: 네이티브 공유 → 실패 시 미리보기 모달 ──
  const handleShare = async () => {
    setBusy('share');
    try {
      const blob = await getBlob();
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
          // NotAllowedError(제스처 만료) 등 → 아래 미리보기 폴백으로
        }
      }
      // 파일 공유 미지원(데스크톱·인앱 브라우저) 또는 실패 → 미리보기 모달
      // (조용한 다운로드는 인앱 브라우저에서 아무 일도 안 일어나 "고장"으로 보였음)
      setPreview(await getUrl());
    } catch (e) {
      console.error('share image failed', e);
      flash('画像の作成に失敗しました');
    } finally {
      setBusy(null);
    }
  };

  // ── 🖼 복사: ClipboardItem(Promise<Blob>) — Safari 호환 핵심 ──
  // ClipboardItem은 반드시 클릭 핸들러 안에서 "동기적으로" 생성해야 하며,
  // 값에 Promise를 넣으면 합성이 끝나기 전에 제스처가 만료돼도 통과한다.
  // 그래서 이 핸들러는 의도적으로 async가 아니다.
  const handleCopy = () => {
    setBusy('copy');
    try {
      const item = new (window as any).ClipboardItem({ 'image/png': getBlob() });
      (navigator.clipboard as any)
        .write([item])
        .then(() => flash('画像をコピーしました ✓'))
        .catch(async () => {
          // 권한 거부·인앱 브라우저 등 → 미리보기 폴백 (롱프레스 복사 안내)
          try { setPreview(await getUrl()); } catch { flash('画像の作成に失敗しました'); }
        })
        .finally(() => setBusy(null));
    } catch {
      // ClipboardItem 생성 자체가 불가한 환경 → 미리보기 폴백
      getUrl()
        .then(setPreview)
        .catch(() => flash('画像の作成に失敗しました'))
        .finally(() => setBusy(null));
    }
  };

  // ── ⬇ 저장: 항상 미리보기 모달 (인앱 브라우저에서도 확실히 동작하는 경로) ──
  const handleSave = async () => {
    setBusy('share');
    try {
      setPreview(await getUrl());
    } catch {
      flash('画像の作成に失敗しました');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={props.className}>
      <button
        onClick={handleShare}
        disabled={busy !== null}
        className="w-full rounded-xl bg-[#C9A227] py-3 text-[14px] font-semibold text-[#14152B] disabled:opacity-60"
      >
        {busy === 'share' ? '画像を作成中…' : '📤 結果を画像でシェア'}
      </button>

      {/* 보조 액션: 복사(지원 브라우저) / 저장 */}
      <div className="mt-2 flex gap-2">
        {canCopy && (
          <button
            onClick={handleCopy}
            disabled={busy !== null}
            className="flex-1 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 py-2.5 text-[12px] text-[#D8D5EE] disabled:opacity-60"
          >
            {busy === 'copy' ? 'コピー中…' : '🖼 画像をコピー'}
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={busy !== null}
          className="flex-1 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 py-2.5 text-[12px] text-[#D8D5EE] disabled:opacity-60"
        >
          ⬇ 画像を保存
        </button>
      </div>

      {note && <p className="mt-2 text-center text-[11px] text-[#8B8DBC]">{note}</p>}

      {/* 미리보기 모달 — 모든 실패 경로의 최종 폴백. 인앱 브라우저에서도
          <img> 롱프레스(PC 우클릭)로 복사·저장이 반드시 가능하다. */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5"
          onClick={() => setPreview(null)}
          role="dialog"
          aria-label="共有画像プレビュー"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#1A1B3A] p-4 ring-1 ring-[#C9A227]/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="占い結果の共有画像"
              className="max-h-[60vh] w-full rounded-lg object-contain"
            />
            <p className="mt-3 text-center text-[11px] leading-relaxed text-[#8B8DBC]">
              画像を長押し（PCは右クリック）で
              <br />
              コピー・保存できます
            </p>
            <div className="mt-3 flex gap-2">
              <a
                href={preview}
                download="hoshidotaro-result.png"
                className="flex-1 rounded-lg bg-[#C9A227] py-2.5 text-center text-[13px] font-medium text-[#14152B]"
              >
                保存する
              </a>
              <button
                onClick={() => setPreview(null)}
                className="flex-1 rounded-lg border border-[#3A3C6B] py-2.5 text-[13px] text-[#B8B4D9]"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
