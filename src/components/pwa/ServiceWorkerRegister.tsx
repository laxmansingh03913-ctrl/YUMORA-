"use client";

import { useEffect } from "react";

/** Registers the PWA service worker (/sw.js) once the app loads. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support is a progressive enhancement; the site works without it.
      });
    }
  }, []);

  return null;
}
