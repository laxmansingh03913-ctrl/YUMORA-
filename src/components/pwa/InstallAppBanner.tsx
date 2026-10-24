"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone } from "lucide-react";

/** The browser's install prompt event (not in the TS DOM lib yet). */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * "Install the Yomika app" banner, shown on the homepage.
 * - Android/desktop Chrome: shows only once the browser fires
 *   beforeinstallprompt (i.e. the app is actually installable).
 * - iPhone/iPad: shows Share → Add to Home Screen instructions.
 * - Already installed: renders nothing.
 */
export function InstallAppBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
      setIsIOS(true);
    }
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!deferred && !isIOS)) return null;

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-black via-[#0d0d18] to-black border border-rose-500/25 shadow-xl shadow-rose-950/20 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <img
        src="/icon.png"
        alt="Yomika app icon"
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-white font-black text-base sm:text-lg leading-tight">
          Yomika App — ab aapke phone me bhi 📱
        </p>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1 leading-relaxed">
          Stories, comics aur novels seedha home screen se — bina browser khole.
          Free hai, aur website se hi install hota hai.
        </p>
        {isIOS && showIOSHelp && (
          <p className="text-amber-300 text-xs sm:text-sm mt-2 leading-relaxed">
            iPhone pe: neeche Share button dabao → “Add to Home Screen” chuno → “Add” dabao.
            Yomika app aapke home screen par aa jayega.
          </p>
        )}
      </div>
      {deferred ? (
        <button
          type="button"
          onClick={install}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm tracking-wide transition shadow-lg shadow-rose-600/30 transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowIOSHelp((v) => !v)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 font-bold text-xs sm:text-sm transition cursor-pointer shrink-0"
        >
          {showIOSHelp ? (
            <Smartphone className="w-4 h-4" />
          ) : (
            <Share className="w-4 h-4" />
          )}
          <span>{showIOSHelp ? "Samajh gaya" : "iPhone pe kaise install karein?"}</span>
        </button>
      )}
    </div>
  );
}
