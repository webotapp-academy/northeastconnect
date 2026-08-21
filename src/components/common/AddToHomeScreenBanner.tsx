"use client";

import React, { useState, useEffect } from "react";
import { soundFX } from "@/lib/soundEffects";

export default function AddToHomeScreenBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already added to homescreen)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return; // Already added to home screen, do not show
    }

    // Check if dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem("nec_pwa_dismissed");
    if (dismissedAt) {
      const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        return;
      }
    }

    // Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice) {
      setIsIos(true);
      if (isSafari) {
        setShowBanner(true);
      }
    }

    // Standard beforeinstallprompt for Android Chrome, Desktop Chrome, Edge, etc.
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If already eligible or desktop chrome
    const timer = setTimeout(() => {
      // Show fallback if not standalone and not dismissed
      if (!isStandalone && !dismissedAt) {
        setShowBanner(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  async function handleInstallClick() {
    soundFX.playPop();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Fallback instructions for browsers without direct prompt
      alert(
        "To add NorthEast Connect to your Home Screen:\n1. Click the browser menu (⋮ or Share icon)\n2. Select 'Add to Home Screen' or 'Install App'"
      );
    }
  }

  function handleDismiss() {
    soundFX.playPop();
    setShowBanner(false);
    localStorage.setItem("nec_pwa_dismissed", Date.now().toString());
  }

  if (!showBanner) return null;

  return (
    <>
      {/* Small horizontal badge just below navbar */}
      <aside
        aria-label="Add to Homescreen"
        className="w-full bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white border-b border-emerald-500/40 shadow-xs z-30 transition-all animate-in slide-in-from-top-2 duration-200"
      >
        <div className="container mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 max-w-7xl">
          {/* App Info & Tag */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base sm:text-lg leading-none shrink-0 drop-shadow-xs">📲</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-extrabold text-[11px] sm:text-xs tracking-tight truncate">
                Add NorthEast Connect to Home Screen
              </span>
              <span className="hidden md:inline text-[11px] text-emerald-100 font-medium">
                — faster access & offline updates
              </span>
            </div>
          </div>

          {/* Action & Close Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-2.5 sm:px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-800 rounded-full font-black text-[10px] sm:text-xs transition active:scale-95 shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span>+</span>
              <span>Install App</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-600/60 transition cursor-pointer text-xs font-bold"
              aria-label="Close add to home screen banner"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <span>📲</span> Install on iOS Safari
              </h3>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button (📤) in Safari toolbar.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong> (➕).</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                <span>Tap <strong>"Add"</strong> in top right corner.</span>
              </p>
            </div>
            <button
              onClick={() => {
                setShowIosGuide(false);
                handleDismiss();
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
