"use client";

import { cn } from "@/lib/utils";

/* ── StatusDot ────────────────────────────────────────────────────── */

export function StatusDot({
  status,
  size = "sm",
}: {
  status: "healthy" | "warning" | "error" | "neutral";
  size?: "sm" | "md";
}) {
  const colors = {
    healthy: "bg-accent",
    warning: "bg-signal-amber",
    error: "bg-signal-red",
    neutral: "bg-text-muted",
  };
  const sizes = { sm: "w-2 h-2", md: "w-2.5 h-2.5" };

  return (
    <span
      className={cn("inline-block rounded-full", colors[status], sizes[size])}
      aria-label={status}
    />
  );
}

/* ── Badge ────────────────────────────────────────────────────────── */

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: "green" | "red" | "amber" | "neutral";
  className?: string;
}) {
  const styles = {
    green:
      "bg-accent-soft text-accent border border-accent-border",
    red: "bg-signal-red-soft text-signal-red border border-signal-red-border",
    amber:
      "bg-signal-amber-soft text-signal-amber border border-signal-amber-border",
    neutral: "bg-neutral-soft text-text-secondary border border-border-subtle",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ── Button ───────────────────────────────────────────────────────── */

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent text-canvas hover:bg-accent-hover",
    secondary:
      "bg-surface-raised text-text-primary border border-border-subtle hover:bg-surface-hover hover:border-border-strong",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-raised",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3.5 text-base gap-2.5",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────── */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-surface-raised",
        className
      )}
    />
  );
}

/* ── EmptyState ───────────────────────────────────────────────────── */

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center mb-4">
        <span className="text-text-muted text-lg">∅</span>
      </div>
      <h3 className="text-sm font-medium text-text-secondary mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-text-muted max-w-xs">{description}</p>
      )}
    </div>
  );
}

/* ── ErrorState ───────────────────────────────────────────────────── */

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-signal-red-soft flex items-center justify-center mb-4">
        <span className="text-signal-red text-lg">!</span>
      </div>
      <h3 className="text-sm font-medium text-text-secondary mb-1">
        Something went wrong
      </h3>
      <p className="text-xs text-text-muted max-w-xs mb-4">
        {message || "Unable to load data. Please try again."}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
