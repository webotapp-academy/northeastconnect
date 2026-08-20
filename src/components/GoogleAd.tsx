"use client";

import { useEffect, useRef } from "react";

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
  const isLoaded = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !isLoaded.current) {
        // Push ad to adsbygoogle array safely
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (err) {
      console.error("AdSense load error:", err);
    }
  }, []);

  return (
    <div className={`google-ad-wrapper my-6 overflow-hidden w-full max-w-full ${className}`}>
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 text-center shadow-xs">
        <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mb-1.5 select-none flex items-center justify-center gap-1">
          <span>📢</span>
          <span>Sponsored Banner</span>
        </div>
        <div className="overflow-hidden flex justify-center min-h-[90px] max-w-full items-center">
          <ins
            className="adsbygoogle"
            style={style}
            data-ad-client="ca-pub-9957106792444386"
            {...(slot ? { "data-ad-slot": slot } : {})}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </div>
      </div>
    </div>
  );
}
