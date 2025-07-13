/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";

export function TawkToScript() {
  useEffect(() => {
    // Check if Tawk.to is already loaded
    if (typeof window !== "undefined" && !(window as any).Tawk_API) {
      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_LoadStart = new Date();

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://embed.tawk.to/68726041ca9122190fdc4433/1ivvcg14t";
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");

      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode?.insertBefore(script, firstScript);
    }
  }, []);

  return null;
}
