const PRODUCTION_SITE_URL = "https://famplan-eight.vercel.app";

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Canonical public URL for links that leave the current browser, such as
 * Supabase magic links and household invitations. Local development stays
 * local; deployed and server-rendered links default to the Vercel production
 * domain unless VITE_SITE_URL explicitly overrides it.
 */
export function getPublicSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) return withoutTrailingSlash(configured);

  if (typeof window !== "undefined") {
    const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
    if (localHosts.has(window.location.hostname))
      return withoutTrailingSlash(window.location.origin);
  }

  return PRODUCTION_SITE_URL;
}

export function publicSiteLink(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicSiteUrl()}${normalizedPath}`;
}
