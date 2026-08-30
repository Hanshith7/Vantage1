"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";
import { Skeleton, EmptyState, ErrorState } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import type { VantageEvent, System } from "@/types";

export default function ActivityPage() {
  const [filter, setFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("today");

  const { data: systems } = useApi<System[]>(() => api.systems.list(), []);
  const { data, error, isLoading, mutate } = useApi<VantageEvent[]>(
    () => api.events.list({ limit: 100 }),
    []
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message={error.message} onRetry={mutate} />;
  if (!data || data.length === 0)
    return <EmptyState title="No activity yet" description="Start demo mode to generate activity." />;

  const systemName = (systemId: string) =>
    systems?.find((s) => s.id === systemId)?.name || "System";

  const filtered = data.filter((ev) => {
    if (filter !== "all" && ev.system_id !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
          Activity
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Recent activity across all connected systems.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          All systems
        </FilterButton>
        {systems?.map((sys) => (
          <FilterButton
            key={sys.id}
            active={filter === sys.id}
            onClick={() => setFilter(sys.id)}
          >
            {sys.name}
          </FilterButton>
        ))}
      </div>

      {/* Activity stream */}
      <div className="space-y-0.5">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-4 py-3.5 px-4 rounded-lg hover:bg-surface-raised/50 transition-colors"
          >
            <span className="text-xs text-text-muted w-16 shrink-0 tabular-nums">
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
            <div className="flex-1 min-w-0">
              <span className="text-sm text-text-secondary truncate block">
                {event.description || event.event_type}
              </span>
            </div>
            <span className="text-xs text-text-muted shrink-0">
              {systemName(event.system_id)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
        active
          ? "bg-accent-soft text-accent border border-accent-border"
          : "bg-surface text-text-secondary border border-border-subtle hover:bg-surface-hover hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
