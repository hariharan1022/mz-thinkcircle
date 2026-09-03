const DEFAULT_API_URL = "http://127.0.0.1:8000";

/**
 * Checks whether a hostname is a numerical IPv4 LAN address (e.g. 192.168.1.10 or 10.201.160.73)
 */
function isLanIp(hostname: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

/**
 * Get the backend API base URL.
 */
export function getApiUrl(): string {
  // 1. Check user-configured override in localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("mz_api_url");
      if (stored && stored.trim()) {
        return stored.trim().replace(/\/+$/, "");
      }
    } catch {}
  }

  // 2. Check environment variable
  let url = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // When accessing locally, normalize to 127.0.0.1 to avoid Windows IPv6 [::1] connection drops
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return url.replace(/localhost/, "127.0.0.1").replace(/\/+$/, "");
    }

    // When accessing via numerical LAN IP, rewrite host to match the student's network origin
    if (isLanIp(hostname)) {
      return url.replace(/127\.0\.0\.1|localhost/, hostname).replace(/\/+$/, "");
    }

    // On cloud domains (e.g. *.vercel.app, *.pages.dev), do NOT append :8000 to the domain!
    // If NEXT_PUBLIC_API_URL is set, use it. Otherwise, return the configured url.
  }

  return url.replace(/\/+$/, "");
}

/**
 * Persist a custom API URL into localStorage.
 */
export function setCustomApiUrl(newUrl: string): void {
  if (typeof window !== "undefined") {
    try {
      if (!newUrl || !newUrl.trim()) {
        localStorage.removeItem("mz_api_url");
      } else {
        localStorage.setItem("mz_api_url", newUrl.trim().replace(/\/+$/, ""));
      }
    } catch {}
  }
}

/**
 * Get the WebSocket backend base URL.
 */
export function getWsBase(): string {
  const apiUrl = getApiUrl();
  if (apiUrl.startsWith("https://")) {
    return apiUrl.replace("https://", "wss://");
  }
  return apiUrl.replace("http://", "ws://");
}
