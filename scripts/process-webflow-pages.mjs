import fs from "fs";
import path from "path";

const WEBFLOW_DIR = "C:/Users/alber/Desktop/webflow-site";
const CONTENT_DIR = "src/app/(marketing)/_content";

const pages = [
  { source: "home-02.html", output: "homepage.html" },
  { source: "about.html", output: "about.html" },
  { source: "features-02.html", output: "features.html" },
  { source: "pricing-02.html", output: "pricing.html" },
  { source: "blog.html", output: "blog.html" },
  { source: "contact.html", output: "contact.html" },
  { source: "privacy-policy.html", output: "privacy-policy.html" },
  { source: "terms-of-conditions.html", output: "terms-of-conditions.html" },
];

function processBody(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  let body = bodyMatch ? bodyMatch[1] : "";

  body = body.replace(/<script[\s\S]*?<\/script>/gi, "");

  body = body.replace(
    /(?<=["'])assets\/cdn\.prod\.website-files\.com\//g,
    "/assets/cdn.prod.website-files.com/"
  );

  const cdnReplacements = [
    [
      "https://cdn.prod.website-files.com/695982a53e42fad24a9984c4/",
      "/assets/cdn.prod.website-files.com/695982a53e42fad24a9984c4/",
    ],
    [
      "https://cdn.prod.website-files.com/695982a63e42fad24a9985b2/",
      "/assets/cdn.prod.website-files.com/695982a63e42fad24a9985b2/",
    ],
  ];

  for (const [from, to] of cdnReplacements) {
    body = body.split(from).join(to);
  }

  body = body.replace(/\sstyle="[^"]*opacity:0[^"]*"/gi, "");

  body = body.replace(/\bSincra\b/g, "Trowas");
  body = body.replace(/\bSinco\b/g, "Trowas");
  body = body.replace(
    /695982a63e42fad24a9986cd_Sincra\.svg/g,
    "Trowas.svg"
  );
  body = body.replace(
    /695982a63e42fad24a998574_Sincra\.svg/g,
    "Trowas.svg"
  );

  const routeReplacements = [
    ['href="index.html"', 'href="/homepage"'],
    ['href="home-01.html"', 'href="/homepage"'],
    ['href="home-02.html"', 'href="/homepage"'],
    ['href="home-03.html"', 'href="/homepage"'],
    ['href="about.html"', 'href="/about"'],
    ['href="features-01.html"', 'href="/features"'],
    ['href="features-02.html"', 'href="/features"'],
    ['href="features-03.html"', 'href="/features"'],
    ['href="pricing-01.html"', 'href="/pricing"'],
    ['href="pricing-02.html"', 'href="/pricing"'],
    ['href="pricing-03.html"', 'href="/pricing"'],
    ['href="blog.html"', 'href="/blog"'],
    ['href="contact.html"', 'href="/contact"'],
    ['href="privacy-policy.html"', 'href="/privacy-policy"'],
    ['href="terms-of-conditions.html"', 'href="/terms-of-conditions"'],
  ];

  for (const [from, to] of routeReplacements) {
    body = body.split(from).join(to);
  }

  body = body.replace(
    /<div class="paragraph-02">©[\s\S]*?<\/div>(?=<a href="#" class="back-to-top-button)/,
    '<div class="paragraph-02">Trowas</div>'
  );

  body = simplifyNavbar(body);
  body = removeCart(body);
  body = removeUtilityPagesFooter(body);
  body = removeCtaSection(body);

  return body;
}

function removeCtaSection(body) {
  return body.replace(
    /<section class="cta">[\s\S]*?<\/section>(?=<section class="footer">)/,
    ""
  );
}

function removeCart(body) {
  return body.replace(
    /<div class="nav-cart-wrap">[\s\S]*?(?=<div class="nav-button-wrapper">)/,
    ""
  );
}

function removeUtilityPagesFooter(body) {
  return body.replace(
    /<div class="footer-menu-list-wrap"><div class="paragraph-01 footer-menu-title">Utility Pages<\/div><div class="footer-menu-list">[\s\S]*?<\/div><\/div>/,
    ""
  );
}

function navDropdownPattern(label) {
  return new RegExp(
    `<li class="nav-item"><div data-delay="0" data-hover="true" data-w-id="[^"]+" class="nav-dropdown w-dropdown"><div class="nav-dropdown-toggle w-dropdown-toggle"><div class="nav-dropdown-icon w-icon-dropdown-toggle"></div><div class="nav-dropdown-text">${label}</div></div><nav class="nav-dropdown-list-wrap[^"]*"[^>]*>[\\s\\S]*?</nav></div></li>`,
    "g"
  );
}

function simplifyNavbar(body) {
  const dropdownToLink = (html, label, href) =>
    html.replace(
      navDropdownPattern(label),
      `<li class="nav-item"><a href="${href}" class="nav-link w-inline-block"><div class="nav-dropdown-text">${label}</div></a></li>`
    );

  body = dropdownToLink(body, "Home", "/homepage");
  body = dropdownToLink(body, "Features", "/features");
  body = dropdownToLink(body, "Pricing", "/pricing");
  body = body.replace(navDropdownPattern("Pages"), "");

  return body;
}

function extractMeta(html) {
  const title =
    html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(/\s*-\s*Sincra.*/i, "") ??
    "Trowas";
  const description =
    html.match(/name="description" content="([^"]+)"/)?.[1] ??
    "Trowas is a smart SaaS solution to automate your workflow.";

  return {
    title: title.includes("Trowas") ? title : `${title} - Trowas`,
    description: description.replace(/\bSincra\b/g, "Trowas"),
  };
}

fs.mkdirSync(CONTENT_DIR, { recursive: true });

const manifest = {};

for (const page of pages) {
  const sourcePath = path.join(WEBFLOW_DIR, page.source);
  const html = fs.readFileSync(sourcePath, "utf8");
  const body = processBody(html);
  const meta = extractMeta(html);

  fs.writeFileSync(path.join(CONTENT_DIR, page.output), body);

  const key = page.output.replace(".html", "");
  manifest[key] = {
    contentFile: page.output,
    title: meta.title.replace(/\bSincra\b/g, "Trowas"),
    description: meta.description,
  };

  console.log(`Processed ${page.source} -> ${page.output} (${body.length} bytes)`);
}

fs.writeFileSync(
  path.join("src/lib/webflow", "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

console.log("Manifest written.");
