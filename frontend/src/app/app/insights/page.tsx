"use client";

import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";
import { Badge, Skeleton, EmptyState, ErrorState } from "@/components/ui";
import type { Insight } from "@/types";

export default function InsightsPage() {
  const { data, error, isLoading, mutate } = useApi<Insight[]>(
    () => api.insights(),
    []
  );

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-32" />{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-40 w-full" />)}</div>;
  if (error) return <ErrorState message={error.message} onRetry={mutate} />;
  if (!data || data.length === 0) return <EmptyState title="No patterns yet" description="Start demo mode to generate insights." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">Patterns worth noticing.</h1>
        <p className="text-text-secondary text-sm mt-1">Intelligence observations across connected systems.</p>
      </div>
      <div className="space-y-4">
        {data.map((insight) => (
          <div key={insight.id} className="p-6 rounded-xl bg-surface border border-border-subtle">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-text-muted mb-1">{insight.system_name}</p>
                <h3 className="text-sm font-semibold text-text-primary">{insight.title}</h3>
              </div>
              <Badge variant={insight.attention_level === "high" || insight.attention_level === "critical" ? "red" : insight.attention_level === "moderate" ? "amber" : "green"}>
                {insight.attention_level}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary mb-4">{insight.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {insight.observed_value != null && (
                <div>
                  <p className="text-text-muted text-xs">Observed</p>
                  <p className="font-medium">{insight.observed_value.toFixed(1)}</p>
                </div>
              )}
              {insight.expected_range && (
                <div>
                  <p className="text-text-muted text-xs">Expected Range</p>
                  <p className="font-medium">{insight.expected_range}</p>
                </div>
              )}
              {insight.trend_direction && (
                <div>
                  <p className="text-text-muted text-xs">Trend</p>
                  <p className="font-medium capitalize">{insight.trend_direction}</p>
                </div>
              )}
            </div>
            {insight.context && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-muted mb-1">Context</p>
                <p className="text-sm text-text-secondary">{insight.context}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
