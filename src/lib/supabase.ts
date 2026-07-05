// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 클라이언트(브라우저)에서 사용 — anon key (RLS 적용됨)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 서버(API 라우트)에서만 사용 — service_role key (RLS 우회)
// ⚠️ 절대 클라이언트 컴포넌트에서 import 금지
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
