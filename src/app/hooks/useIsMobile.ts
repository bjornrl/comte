"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 1023px)";

/**
 * Returns:
 *   - null on the server / first client render (avoids hydration mismatch)
 *   - true  if the viewport is below the desktop breakpoint
 *   - false otherwise
 *
 * Callers should render nothing (or a neutral shell) while the value is null.
 */
export function useIsMobile(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
