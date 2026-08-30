"use client";

import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";
import { Badge, Skeleton, EmptyState, ErrorState } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import type { System } from "@/types";

export default function SystemsPage() {
  const { data, error, isLoading, mutate } = useApi<System[]>(
    () => api.systems.list(),
    []
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message={error.message} onRetry={mutate} />;
  if (!data || data.length === 0)
    return <EmptyState title="No connected systems" description="Start demo mode to see connected systems." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
          Systems
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Connected institutional systems and their current state.
        </p>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 text-xs font-medium text-text-muted uppercase tracking-wider px-6 py-3 bg-surface-raised border-b border-border-subtle">
          <span className="col-span-2">System</span>
          <span>Status</span>
          <span>Last Activity</span>
          <span className="text-right">Events</span>
        </div>

        {/* Rows */}
        {data.map((system) => (
          <Link
            key={system.id}
            href={`/app/systems/${system.id}`}
            className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border-subtle last:border-b-0 hover:bg-surface-hover/50 transition-colors group"
          >
            <div className="col-span-2">
              <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                {system.name}
              </span>
              {system.description && (
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {system.description}
                </p>
              )}
            </div>
            <div className="flex items-center">
              <Badge
                variant={
                  system.status === "connected"
                    ? "green"
                    : system.status === "degraded"
                    ? "amber"
                    : system.status === "error"
                    ? "red"
                    : "neutral"
                }
              >
                {system.status}
              </Badge>
            </div>
            <span className="text-sm text-text-secondary flex items-center">
              {system.last_seen ? formatRelativeTime(system.last_seen) : "—"}
            </span>
            <span className="text-sm text-text-secondary text-right">
              {system.event_count.toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
