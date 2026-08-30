/* ── Vantage API Client ───────────────────────────────────────────── */

import type {
  System,
  SystemDetail,
  VantageEvent,
  Signal,
  Analytics,
  Insight,
  Overview,
  Connector,
  DemoStatus,
  Health,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(`API error: ${res.statusText}`, res.status);
  }

  return res.json() as Promise<T>;
}

/* ── Health ────────────────────────────────────────────────────────── */

export const api = {
  health: () => request<Health>("/health"),

  /* ── Overview ──────────────────────────────────────────────────── */
  overview: () => request<Overview>("/overview"),

  /* ── Systems ───────────────────────────────────────────────────── */
  systems: {
    list: () => request<System[]>("/systems"),
    get: (id: string) => request<SystemDetail>(`/systems/${id}`),
    activity: (id: string, limit = 50) =>
      request<VantageEvent[]>(`/systems/${id}/activity?limit=${limit}`),
    analytics: (id: string) => request<Analytics>(`/systems/${id}/analytics`),
  },

  /* ── Events ────────────────────────────────────────────────────── */
  events: {
    list: (params?: { system_id?: string; status?: string; limit?: number }) => {
      const search = new URLSearchParams();
      if (params?.system_id) search.set("system_id", params.system_id);
      if (params?.status) search.set("status", params.status);
      if (params?.limit) search.set("limit", String(params.limit));
      const qs = search.toString();
      return request<VantageEvent[]>(`/events${qs ? `?${qs}` : ""}`);
    },
  },

  /* ── Signals ───────────────────────────────────────────────────── */
  signals: {
    list: (params?: { status?: string; attention_level?: string; system_id?: string }) => {
      const search = new URLSearchParams();
      if (params?.status) search.set("status", params.status);
      if (params?.attention_level) search.set("attention_level", params.attention_level);
      if (params?.system_id) search.set("system_id", params.system_id);
      const qs = search.toString();
      return request<Signal[]>(`/signals${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => request<Signal>(`/signals/${id}`),
    review: (id: string) =>
      request<Signal>(`/signals/${id}/review`, { method: "POST" }),
    resolve: (id: string, body?: { note?: string; resolved_by?: string }) =>
      request<Signal>(`/signals/${id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ action: "resolve", ...body }),
      }),
  },

  /* ── Insights ──────────────────────────────────────────────────── */
  insights: () => request<Insight[]>("/insights"),

  /* ── Connectors ────────────────────────────────────────────────── */
  connectors: {
    list: () => request<Connector[]>("/connectors"),
    sync: (id: string) =>
      request<{ connector_id: string; status: string; message: string }>(
        `/connectors/${id}/sync`,
        { method: "POST" }
      ),
  },

  /* ── Demo ──────────────────────────────────────────────────────── */
  demo: {
    status: () => request<DemoStatus>("/demo/status"),
    start: () => request<DemoStatus>("/demo/start", { method: "POST" }),
    reset: () => request<DemoStatus>("/demo/reset", { method: "POST" }),
    scenario: (n: number) =>
      request<DemoStatus>(`/demo/scenario/${n}`, { method: "POST" }),
    resolve: () => request<DemoStatus>("/demo/resolve", { method: "POST" }),
  },
};

export { ApiError };
export default api;
