"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/");
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
      <p className="text-sm text-[#8a8480]">로그인 중...</p>
    </main>
  );
}