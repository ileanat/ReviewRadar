const configured = (import.meta.env.VITE_CLIENT_ENV ?? "").replace(/\/$/, "");

/**
 * When testing on a phone via LAN IP, VITE_CLIENT_ENV often points at localhost
 * which the phone cannot reach. Fall back to same-origin /api (Vite proxy).
 */
export function getApiBase(): string {
  if (!configured) return "";
  if (typeof window === "undefined") return configured;

  const pointsAtLocalhost =
    configured.includes("localhost") || configured.includes("127.0.0.1");
  const onRemoteHost =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  if (pointsAtLocalhost && onRemoteHost) return "";
  return configured;
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

const aiWorkerConfigured = (import.meta.env.VITE_AI_WORKER_URL ?? "").replace(/\/$/, "");

/**
 * On mobile/LAN dev, call the AI worker via same-origin /ai (Vite proxy) so the
 * phone never hits localhost or cross-origin CORS on the worker URL directly.
 */
export function aiWorkerUrl(): string {
  if (!aiWorkerConfigured) return "";
  if (typeof window === "undefined") return aiWorkerConfigured;

  const onRemoteHost =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  if (import.meta.env.DEV && onRemoteHost) return "/ai";

  const pointsAtLocalhost =
    aiWorkerConfigured.includes("localhost") ||
    aiWorkerConfigured.includes("127.0.0.1");

  if (pointsAtLocalhost && onRemoteHost) return "/ai";

  return aiWorkerConfigured;
}
