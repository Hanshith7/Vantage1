"use client";

import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";
import { getGreeting, formatRelativeTime, getAttentionColor } from "@/lib/utils";
import { Badge, Skeleton, EmptyState, ErrorState } from "@/components/ui";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import type { Overview } from "@/types";

export default function OverviewPage() {
  const { data, error, isLoading, mutate } = useApi<Overview>(
    () => api.overview(),
    []
  );

  if (isLoading) return <OverviewSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={mutate} />;
  if (!data) return <EmptyState title="No data available" />;

  const { stats, attention_signals, recent_events } = data;

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
          {getGreeting()}.
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Here&apos;s what changed across your connected systems.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatItem label="CONNECTED SYSTEMS" value={String(stats.connected_systems).padStart(2, "0")} />
        <StatItem
          label="NEEDS ATTENTION"
          value={String(stats.needs_attention).padStart(2, "0")}
          highlight={stats.needs_attention > 0}
        />
        <StatItem label="ACTIVE SIGNALS" value={String(stats.active_signals).padStart(2, "0")} />
        <StatItem
          label="LAST UPDATED"
          value={stats.last_updated ? formatRelativeTime(stats.last_updated) : "—"}
        />
      </div>

      {/* Needs attention */}
      {attention_signals.length > 0 && (
        <section>
          <h2 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-4">
            What needs attention
          </h2>
          <div className="space-y-3">
            {attention_signals.slice(0, 3).map((signal) => (
              <Link
                key={signal.id}
                href={`/app/attention/${signal.id}`}
                className="block p-5 rounded-xl bg-surface border border-border-subtle hover:border-border-strong hover:bg-surface-raised transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-text-muted">{signal.system_name || "System"}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                      {signal.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {signal.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge
                      variant={
                        signal.attention_level === "high" || signal.attention_level === "critical"
                          ? "red"
                          : signal.attention_level === "moderate"
                          ? "amber"
                          : "neutral"
                      }
                    >
                      {signal.attention_level} attention
                    </Badge>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock size={10} />
                      {formatRelativeTime(signal.first_detected)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium tracking-widest text-text-muted uppercase">
            What changed recently
          </h2>
          <Link
            href="/app/activity"
            className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-1">
          {recent_events.length === 0 ? (
            <p className="text-sm text-text-muted py-4">No recent activity</p>
          ) : (
            recent_events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-surface-raised/50 transition-colors"
              >
                <span className="text-xs text-text-muted w-14 shrink-0">
                  {formatRelativeTime(event.timestamp)}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      event.status === "deviation"
                        ? "var(--signal-red)"
                        : "var(--surface-hover)",
                  }}
                />
                <span className="text-sm text-text-secondary truncate">
                  {event.description || event.event_type}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium tracking-widest text-text-muted uppercase mb-1">
        {label}
      </p>
      <p
        className="text-xl font-bold tracking-tight"
        style={{ color: highlight ? "var(--signal-red)" : "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-10">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
