export const MARKETING_ROUTES = [
  "/homepage",
  "/about",
  "/features",
  "/pricing",
  "/blog",
  "/contact",
  "/privacy-policy",
  "/terms-of-conditions",
] as const;

export function isMarketingRoute(pathname: string | null | undefined) {
  if (!pathname) return false;
  return MARKETING_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
