import url from "url";

/**
 * Returns true if the request URL is an OAuth callback (path / with a `code` query param).
 * Uses parsed query so we detect callbacks regardless of parameter order
 * (e.g. /?iss=...&code=...&scope=... not just /?code=...).
 */
export function isOAuthCallbackUrl(requestUrl: string): boolean {
  const parsed = url.parse(requestUrl ?? "", true);
  return parsed.pathname === "/" && Boolean(parsed.query?.code);
}
