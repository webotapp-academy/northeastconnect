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
    <div className={`google-ad-wrapper my-6 overflow-hidden ${className}`}>
      <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-3 text-center shadow-xs">
        <div className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mb-1.5 select-none">
          Advertisement
        </div>
        <div className="overflow-hidden flex justify-center min-h-[90px] items-center">
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
