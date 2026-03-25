/** Next.js throws this during prerender when `cookies()` / dynamic APIs are used. Must rethrow — do not treat as app failure. */
export function isNextDynamicUsageError(e: unknown): boolean {
  return e instanceof Error && /dynamic server usage/i.test(e.message);
}
