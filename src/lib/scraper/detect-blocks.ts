export type ScrapeErrorCode = "BLOCKED" | "TIMEOUT" | "NAVIGATION_ERROR";

export class ScrapeError extends Error {
  code: ScrapeErrorCode;

  constructor(code: ScrapeErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "ScrapeError";
  }
}

export const BLOCK_MARKERS = [
  "access denied",
  "forbidden",
  "captcha",
  "cloudflare",
  "bot",
  "request blocked",
  "verify you are human",
];

export function isBlockedResponse(status: number, bodyText: string): boolean {
  if (status === 403 || status === 429) {
    return true;
  }
  const lower = bodyText.toLowerCase();
  return BLOCK_MARKERS.some((marker) => lower.includes(marker));
}
