import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 서버 사이드용 (API Route에서 사용)
export const supabase = createClient(
  supabaseUrl,
  typeof window === "undefined" ? supabaseServiceKey : supabaseAnonKey
);

// 클라이언트 사이드용 (로그인 페이지 등에서 사용)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);