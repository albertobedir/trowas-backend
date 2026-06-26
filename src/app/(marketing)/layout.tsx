import Script from "next/script";
import "./webflow.css";

const WEBFLOW_CSS =
  "/assets/cdn.prod.website-files.com/695982a53e42fad24a9984c4/css/rols-trendy-site.webflow.shared.efa1d977e.css";
const ASSETS_BASE =
  "/assets/cdn.prod.website-files.com/695982a53e42fad24a9984c4";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="stylesheet" href={WEBFLOW_CSS} type="text/css" />
      {children}
      <Script
        src="/assets/d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js"
        strategy="afterInteractive"
      />
      <Script
        src={`${ASSETS_BASE}/js/webflow.schunk.f3a08821b4e31f89.js`}
        strategy="afterInteractive"
      />
      <Script
        src={`${ASSETS_BASE}/js/webflow.schunk.57404f54bb46411e.js`}
        strategy="afterInteractive"
      />
      <Script
        src={`${ASSETS_BASE}/js/webflow.3ab0394f.986831c77f6b103b.js`}
        strategy="afterInteractive"
      />
      <Script
        src={`${ASSETS_BASE}/js/webflow.81b7545a.bf770f66896fb70c.js`}
        strategy="afterInteractive"
      />
      <Script
        src={`${ASSETS_BASE}/js/webflow.a1e0bdaf.25c6ab7b2c31857f.js`}
        strategy="afterInteractive"
      />
    </>
  );
}
