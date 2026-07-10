// src/lib/rateLimit.ts
// S-2. 일일 AI 호출 상한 (IP 해시 기준)
//
// 이전 문제: increment_ai_call로 "기록"만 하고, 그 수를 읽어 "차단"하는 코드가 없었음.
// dailyGate(localStorage)는 시크릿 창/curl로 우회 가능 → Claude 비용 폭주 리스크.
//
// 이제: 06_migration_rate_limit.sql 적용 후 increment_ai_call이 증가 후 count를
// 반환하므로, 상한 초과 시 라우트가 429를 반환한다.
//
// 설계 원칙:
//   - fail-open: DB 장애/RPC 오류 시에는 서비스를 막지 않고 통과시킨다.
//     (레이트리밋은 비용 보험이지, 가용성보다 우선하지 않음)
//   - IP는 SHA-256 해시로만 저장 (원본 IP 미보관 — 기존 방침 유지)
//   - Vercel에서는 x-real-ip가 플랫폼이 세팅하는 신뢰 가능한 값.
//     x-forwarded-for는 클라이언트가 앞에 값을 끼워넣을 수 있어 보조로만 사용.

import { headers } from 'next/headers';
import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

/** 기본 상한: IP당 하루 20회. Vercel 환경변수 AI_DAILY_LIMIT로 조정 가능. */
const DEFAULT_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 20);

export interface RateLimitResult {
  ok: boolean;
  /** 증가 후의 오늘 호출 수 (RPC 실패 시 undefined) */
  count?: number;
}

/** 요청자의 IP를 해시한 식별자. 원본 IP는 어디에도 저장하지 않는다. */
export async function getRequestIdentifier(): Promise<string> {
  const h = await headers();
  const realIp = h.get('x-real-ip');
  const fwd = h.get('x-forwarded-for') ?? '';
  const ip = (realIp || fwd.split(',')[0]?.trim() || 'unknown').slice(0, 64);
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * 호출 수를 1 올리고, 상한 초과 여부를 판단한다.
 * 사용처: /api/fortune/result, /api/decision/result (Claude를 호출하는 라우트)
 *
 *   const rl = await enforceDailyAiLimit(supabaseAdmin, dateStr);
 *   if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
 */
export async function enforceDailyAiLimit(
  supabaseAdmin: SupabaseClient,
  dateStr: string,
  limit: number = DEFAULT_DAILY_LIMIT
): Promise<RateLimitResult> {
  try {
    const id = await getRequestIdentifier();
    const { data, error } = await supabaseAdmin.rpc('increment_ai_call', {
      p_id: id,
      p_date: dateStr,
    });
    if (error) return { ok: true }; // fail-open
    const count = typeof data === 'number' ? data : Number(data);
    if (Number.isFinite(count) && count > limit) return { ok: false, count };
    return { ok: true, count: Number.isFinite(count) ? count : undefined };
  } catch {
    return { ok: true }; // fail-open
  }
}
