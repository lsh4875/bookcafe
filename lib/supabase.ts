import { createBrowserClient } from "@supabase/ssr";

// 클라이언트 컴포넌트에서 사용 (싱글톤)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 기존 코드 호환용 (점진적 교체)
export const supabaseClient = createClient();
