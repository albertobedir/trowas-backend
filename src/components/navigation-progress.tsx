"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

function isInternalNavigationLink(anchor: HTMLAnchorElement, pathname: string) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin && url.pathname !== pathname;
  } catch {
    return false;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor || !isInternalNavigationLink(anchor, pathname)) {
        return;
      }

      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden bg-neutral-100/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600"
            initial={{ x: "-100%" }}
            animate={{ x: ["0%", "280%"] }}
            transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
