function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function sanitizeNextPath(nextPath: string) {
  if (!nextPath.startsWith("/")) return "/";
  if (nextPath.startsWith("//")) return "/";
  return nextPath;
}

export function resolvePublicSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return trimTrailingSlash(fromEnv);
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export function buildAuthCallbackUrl(nextPath = "/") {
  const siteUrl = resolvePublicSiteUrl();
  const safeNext = sanitizeNextPath(nextPath);
  return `${siteUrl}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
