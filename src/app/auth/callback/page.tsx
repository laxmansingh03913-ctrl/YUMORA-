"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.replace("/");
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        router.replace("/");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
      <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      <p className="text-sm font-semibold text-zinc-300">
        Completing secure sign-in to Yumora...
      </p>
    </div>
  );
}
