"use client";

import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";
import { Badge, Skeleton, EmptyState, ErrorState } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { Clock } from "lucide-react";
import Link from "next/link";
import type { Signal } from "@/types";

export default function AttentionPage() {
  const { data, error, isLoading, mutate } = useApi<Signal[]>(
    () => api.signals.list(),
    []
  );

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-40" />{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-24 w-full" />)}</div>;
  if (error) return <ErrorState message={error.message} onRetry={mutate} />;
  if (!data || data.length === 0) return <EmptyState title="Nothing needs attention" description="All systems are operating within expected patterns." />;

  const active = data.filter(s => s.status !== "resolved");
  const resolved = data.filter(s => s.status === "resolved");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">Needs attention</h1>
        <p className="text-text-secondary text-sm mt-1">Signals that may require human review.</p>
      </div>

      {active.length > 0 && (
        <section className="space-y-3">
          {active.map(signal => (
            <Link key={signal.id} href={`/app/attention/${signal.id}`}
              className="block p-5 rounded-xl bg-surface border border-border-subtle hover:border-border-strong hover:bg-surface-raised transition-all duration-200 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-text-muted">{signal.system_name || "System"}</span>
                    <Badge variant={signal.status === "under_review" ? "amber" : signal.attention_level === "high" || signal.attention_level === "critical" ? "red" : "amber"}>
                      {signal.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{signal.title}</h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{signal.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={signal.attention_level === "high" || signal.attention_level === "critical" ? "red" : signal.attention_level === "moderate" ? "amber" : "neutral"}>
                    {signal.attention_level} attention
                  </Badge>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Clock size={10} />{formatRelativeTime(signal.first_detected)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      {resolved.length > 0 && (
        <section>
          <h2 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-4">Resolved</h2>
          <div className="space-y-2">
            {resolved.map(signal => (
              <Link key={signal.id} href={`/app/attention/${signal.id}`}
                className="block p-4 rounded-xl bg-surface/50 border border-border-subtle hover:bg-surface-raised/50 transition-all duration-200 opacity-70 hover:opacity-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm text-text-secondary">{signal.title}</span>
                  </div>
                  <Badge variant="green">Resolved</Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
