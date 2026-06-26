import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { WebflowPageContent } from "@/components/webflow/WebflowPageContent";
import { fixMarketingImageUrlsHtml } from "@/lib/webflow/fix-marketing-image-urls";
import { injectMarketingDashboardLinksHtml } from "@/lib/webflow/inject-marketing-dashboard-links";
import { removeMarketingTrialCtasHtml } from "@/lib/webflow/remove-marketing-trial-ctas";
import manifest from "@/lib/webflow/manifest.json";

type WebflowPageKey = keyof typeof manifest;

export function createWebflowPage(key: WebflowPageKey) {
  const config = manifest[key];

  function WebflowPage() {
    const htmlPath = path.join(
      process.cwd(),
      "src/app/(marketing)/_content",
      config.contentFile
    );
    const html = injectMarketingDashboardLinksHtml(
      removeMarketingTrialCtasHtml(
        fixMarketingImageUrlsHtml(fs.readFileSync(htmlPath, "utf8")),
      ),
    );
    return <WebflowPageContent html={html} />;
  }

  const metadata: Metadata = {
    title: config.title,
    description: config.description,
  };

  return { Page: WebflowPage, metadata };
}
