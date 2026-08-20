"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface GoogleAdProps {
  slot?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function GoogleAd({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style = { display: "block" },
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adStatus, setAdStatus] = useState<"loading" | "filled" | "unfilled">("loading");
  const isPushed = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const timer = setTimeout(() => {
      try {
        if (!isPushed.current && adRef.current) {
          // Push ad unit safely to AdSense queue
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          isPushed.current = true;
        }
      } catch (err) {
        console.warn("AdSense push notice:", err);
      }
    }, 150);

    // Watch for AdSense fill status
    const observer = new MutationObserver(() => {
      if (adRef.current) {
        const status = adRef.current.getAttribute("data-ad-status");
        if (status === "filled") {
          setAdStatus("filled");
        } else if (status === "unfilled") {
          setAdStatus("unfilled");
        }
      }
    });

    if (adRef.current) {
      observer.observe(adRef.current, { attributes: true, attributeFilter: ["data-ad-status"] });
    }

    // Safety timeout: if after 3.5s AdSense hasn't filled, show clean fallback spotlight
    const fallbackTimer = setTimeout(() => {
      if (adStatus === "loading" && adRef.current?.getAttribute("data-ad-status") !== "filled") {
        // If no iframe loaded with content, treat as fallback
        const hasIframe = adRef.current?.querySelector("iframe");
        if (!hasIframe) {
          setAdStatus("unfilled");
        }
      }
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [adStatus]);

  return (
    <div className={`google-ad-wrapper my-4 overflow-hidden w-full max-w-full ${className}`}>
      <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-colors">
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase mb-2 select-none flex items-center justify-between px-1">
          <span className="flex items-center gap-1">
            <span>📢</span>
            <span>Sponsored Spotlight</span>
          </span>
          <Link
            href="/contact"
            className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline normal-case font-medium"
          >
            Advertise with us
          </Link>
        </div>

        {/* AdSense In-Place Container */}
        <div className="overflow-hidden flex justify-center min-h-[90px] max-w-full items-center">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{
              ...style,
              display: "block",
              width: "100%",
              minHeight: "90px",
            }}
            data-ad-client="ca-pub-9957106792444386"
            {...(slot ? { "data-ad-slot": slot } : {})}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </div>

        {/* Beautiful Native Fallback when AdSense is unfilled / local */}
        {adStatus === "unfilled" && (
          <div className="py-3 px-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-slate-100">
                <span>🌿</span>
                <span>Promote Your Local Business or Homestay</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Reach thousands of active explorers and buyers across the 8 Northeast states.
              </p>
            </div>
            <Link
              href="/marketplace/new"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs shrink-0 transition"
            >
              Post Free Ad &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
