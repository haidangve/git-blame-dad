/**
 * Where to send someone after sign-in. Only same-site paths are allowed:
 * "//evil.com" and "/\evil.com" are protocol-relative URLs browsers will
 * follow off-site, so they fall back to "/".
 */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
