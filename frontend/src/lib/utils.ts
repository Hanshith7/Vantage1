import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;

  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return formatDate(iso);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getAttentionColor(level: string): string {
  switch (level) {
    case "critical":
    case "high":
      return "var(--signal-red)";
    case "moderate":
      return "var(--signal-amber)";
    default:
      return "var(--text-muted)";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "resolved":
      return "var(--accent-green)";
    case "under_review":
    case "developing":
      return "var(--signal-amber)";
    case "needs_attention":
    case "detected":
      return "var(--signal-red)";
    default:
      return "var(--text-muted)";
  }
}
