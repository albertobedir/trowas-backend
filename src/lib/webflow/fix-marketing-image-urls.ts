const WEBFLOW_ASSETS_PREFIX = "/assets/cdn.prod.website-files.com/";
const BLOG_ASSETS_DIR =
  "/assets/cdn.prod.website-files.com/695982a63e42fad24a9985b2/";

export const BLOG_CARD_IMAGE_URLS = [
  `${BLOG_ASSETS_DIR}695982a63e42fad24a9985b5_Blog%2520Image%252001.avif`,
  `${BLOG_ASSETS_DIR}695982a63e42fad24a998664_Blog%2520Image%252002.avif`,
  `${BLOG_ASSETS_DIR}695982a63e42fad24a998644_Blog%2520Image%252003.avif`,
  `${BLOG_ASSETS_DIR}695982a63e42fad24a9986f1_Blog%2520Image%252004.avif`,
  `${BLOG_ASSETS_DIR}695982a63e42fad24a9986d1_Blog%2520Image%252005.avif`,
  `${BLOG_ASSETS_DIR}695982a63e42fad24a9986bc_Blog%2520Image%252006.avif`,
] as const;

export function encodeAssetFilenameForUrl(filename: string): string {
  let normalized = filename;

  try {
    normalized = decodeURIComponent(filename);
  } catch {
    normalized = filename;
  }

  if (normalized.includes(" ")) {
    normalized = normalized.replace(/ /g, "%20");
  }

  return normalized.replace(/%/g, "%25");
}

export function toPublicAssetUrl(relativePathFromAssetsRoot: string): string {
  const cleanPath = relativePathFromAssetsRoot.replace(/^\/+/, "");
  const parts = cleanPath.split("/");
  const filename = parts.pop() ?? "";
  const encodedFilename = encodeAssetFilenameForUrl(filename);
  return `${WEBFLOW_ASSETS_PREFIX}${parts.join("/")}/${encodedFilename}`;
}

export function normalizeMarketingBrandingHtml(html: string): string {
  return html
    .replace(/\bSincra\b/g, "RolCard")
    .replace(/\bSinco\b/g, "RolCard")
    .replace(/\bRol Card\b/g, "RolCard")
    .replace(/\bTrowas\b/g, "RolCard")
    .replace(/695982a63e42fad24a9986cb_Sincra\.svg/g, "RolCard.svg")
    .replace(/695982a63e42fad24a9986cd_Sincra\.svg/g, "RolCard.svg")
    .replace(/695982a63e42fad24a998574_Sincra\.svg/g, "RolCard.svg");
}

export function fixMarketingImageUrlsHtml(html: string): string {
  let result = html.replace(
    /src="(\/assets\/cdn\.prod\.website-files\.com\/[^"]+)"/g,
    (_match, urlPath: string) => {
      const parts = urlPath.split("/");
      const filename = parts.pop() ?? "";
      const encodedFilename = encodeAssetFilenameForUrl(filename);
      return `src="${parts.join("/")}/${encodedFilename}"`;
    },
  );

  result = fixBlogCardImagesHtml(result);
  return result;
}

function fixBlogCardImagesHtml(html: string): string {
  if (!BLOG_CARD_IMAGE_URLS.length) {
    return html;
  }

  let imageIndex = 0;

  return html.replace(
    /(<(?:img|source)[^>]+src=")\/assets\/cdn\.prod\.website-files\.com\/695982a63e42fad24a9985b2\/[^"]+\.avif(")/g,
    (_match, prefix: string, suffix: string) => {
      const nextImage =
        BLOG_CARD_IMAGE_URLS[imageIndex % BLOG_CARD_IMAGE_URLS.length] ??
        BLOG_CARD_IMAGE_URLS[0];
      imageIndex += 1;
      return `${prefix}${nextImage}${suffix}`;
    },
  );
}

export function setupMarketingImageFallbacks(root: ParentNode) {
  if (!BLOG_CARD_IMAGE_URLS.length) return;

  let fallbackIndex = 0;

  root.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") ?? "";
    if (!src.includes("695982a63e42fad24a9985b2") || !src.includes("Blog")) {
      return;
    }

    if (img.dataset.fallbackReady === "true") return;
    img.dataset.fallbackReady = "true";

    img.addEventListener(
      "error",
      () => {
        if (img.dataset.fallbackApplied === "true") return;

        const fallback =
          BLOG_CARD_IMAGE_URLS[fallbackIndex % BLOG_CARD_IMAGE_URLS.length] ??
          BLOG_CARD_IMAGE_URLS[0];
        fallbackIndex += 1;
        img.dataset.fallbackApplied = "true";
        img.src = fallback;
      },
      { once: true },
    );
  });
}
