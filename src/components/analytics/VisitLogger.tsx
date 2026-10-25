"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Logs one visit per page navigation to /api/visits (path + time only).
// Renders nothing.
export function VisitLogger() {
  const pathname = usePathname();
  const lastLogged = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastLogged.current === pathname) return;
    lastLogged.current = pathname;
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
