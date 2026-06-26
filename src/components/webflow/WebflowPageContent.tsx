"use client";

import { useEffect } from "react";
import { setupMarketingImageFallbacks } from "@/lib/webflow/fix-marketing-image-urls";
import { injectMarketingDashboardLinks } from "@/lib/webflow/inject-marketing-dashboard-links";
import { removeMarketingTrialCtas } from "@/lib/webflow/remove-marketing-trial-ctas";

type WebflowPageContentProps = {
  html: string;
};

export function WebflowPageContent({ html }: WebflowPageContentProps) {
  useEffect(() => {
    const htmlEl = document.documentElement;
    if (!htmlEl.className.includes("w-mod-js")) {
      htmlEl.className += " w-mod-js";
    }
    if (
      "ontouchstart" in window &&
      !htmlEl.className.includes("w-mod-touch")
    ) {
      htmlEl.className += " w-mod-touch";
    }

    document.body.classList.add("body");
    document.body.style.background = "";
    document.body.style.margin = "0";

    const revealHiddenElements = () => {
      document
        .querySelectorAll(".webflow-page [style*='opacity:0']")
        .forEach((el) => {
          const node = el as HTMLElement;
          node.style.opacity = "1";
          node.style.transform = "none";
        });
    };

    const enhanceMarketingPage = () => {
      const root = document.querySelector(".webflow-page") ?? document;
      removeMarketingTrialCtas(root);
      injectMarketingDashboardLinks(root);
      setupMarketingImageFallbacks(root);
    };

    revealHiddenElements();
    enhanceMarketingPage();

    const initWebflow = () => {
      const webflow = (window as Window & { Webflow?: { ready?: () => void } })
        .Webflow;
      webflow?.ready?.();
      revealHiddenElements();
      enhanceMarketingPage();
    };

    if ((window as Window & { Webflow?: unknown }).Webflow) {
      initWebflow();
    } else {
      window.addEventListener("load", initWebflow);
    }

    return () => {
      window.removeEventListener("load", initWebflow);
      document.body.classList.remove("body");
    };
  }, [html]);

  return (
    <div
      className="webflow-page"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
