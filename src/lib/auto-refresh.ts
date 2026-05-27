// Auto-refresh utility for daily updates
// Checks localStorage for last update time and triggers refresh if needed

const LAST_REFRESH_KEY = "autocatalog_last_refresh";
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function shouldAutoRefresh(): boolean {
  if (typeof window === "undefined") return false;
  const lastRefresh = localStorage.getItem(LAST_REFRESH_KEY);
  if (!lastRefresh) return true;
  const lastRefreshTime = new Date(lastRefresh).getTime();
  const now = Date.now();
  return now - lastRefreshTime >= REFRESH_INTERVAL_MS;
}

export function markRefreshed(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_REFRESH_KEY, new Date().toISOString());
}

export function getLastRefreshTime(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_REFRESH_KEY);
}
