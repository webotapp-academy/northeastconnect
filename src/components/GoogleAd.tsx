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
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !isLoaded.current) {
        // Push ad to adsbygoogle array
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (err) {
      console.error("AdSense load error:", err);
    }
  }, []);

  return (
    <div className={`google-ad-container my-6 text-center overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-9957106792444386"
        {...(slot ? { "data-ad-slot": slot } : {})}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
