"use client";

import { use, useState } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";
import { Badge, Button, Skeleton, ErrorState, EmptyState } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Eye } from "lucide-react";
import Link from "next/link";
import type { Signal } from "@/types";

export default function SignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: signal, error, isLoading, mutate } = useApi<Signal>(() => api.signals.get(id), [id]);
  const [acting, setActing] = useState(false);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (error) return <ErrorState message={error.message} onRetry={mutate} />;
  if (!signal) return <EmptyState title="Signal not found" />;

  const handleReview = async () => {
    setActing(true);
    try { await api.signals.review(id); mutate(); } catch {} finally { setActing(false); }
  };

  const handleResolve = async () => {
    setActing(true);
    try { await api.signals.resolve(id, { resolved_by: "Admin" }); mutate(); } catch {} finally { setActing(false); }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <Link href="/app/attention" className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1">
        <ArrowLeft size={12} /> Needs Attention
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant={signal.attention_level === "high" || signal.attention_level === "critical" ? "red" : signal.attention_level === "moderate" ? "amber" : "neutral"}>
            {signal.attention_level} attention
          </Badge>
          <Badge variant={signal.status === "resolved" ? "green" : signal.status === "under_review" ? "amber" : "red"}>
            {signal.status.replace("_", " ")}
          </Badge>
        </div>
        <h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight">{signal.title}</h1>
        <p className="text-text-muted text-xs mt-2">
          {signal.system_name} · Detected {formatRelativeTime(signal.first_detected)}
        </p>
      </div>

      {/* Explanation */}
      {signal.explanation && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-surface border border-border-subtle space-y-6">
            <div>
              <h3 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-2">What changed?</h3>
              <p className="text-sm text-text-primary">{signal.explanation.what_changed}</p>
            </div>
            <div className="border-t border-border-subtle" />
            <div>
              <h3 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-2">Why was it noticed?</h3>
              <ul className="space-y-1.5">
                {signal.explanation.why_noticed.map((r, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-signal-red mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            {signal.explanation.related_context.length > 0 && (
              <>
                <div className="border-t border-border-subtle" />
                <div>
                  <h3 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-2">Related activity</h3>
                  {signal.explanation.related_context.map((ctx, i) => (
                    <p key={i} className="text-sm text-text-secondary">{ctx}</p>
                  ))}
                </div>
              </>
            )}
            <div className="border-t border-border-subtle" />
            <div>
              <h3 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-2">Current state</h3>
              <span className="text-sm font-medium" style={{
                color: signal.status === "resolved" ? "var(--accent-green)" : signal.status === "under_review" ? "var(--signal-amber)" : "var(--signal-red)"
              }}>
                {signal.explanation.current_state}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Score */}
      {signal.deviation_score != null && (
        <div className="p-4 rounded-xl bg-surface border border-border-subtle">
          <p className="text-xs text-text-muted mb-1">Deviation Score</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-surface-raised overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${signal.deviation_score * 100}%`,
                backgroundColor: signal.deviation_score > 0.7 ? "var(--signal-red)" : signal.deviation_score > 0.4 ? "var(--signal-amber)" : "var(--accent-green)"
              }} />
            </div>
            <span className="text-xs text-text-secondary tabular-nums">{(signal.deviation_score * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {signal.status !== "resolved" && (
        <div className="flex gap-3">
          {signal.status !== "under_review" && (
            <Button variant="secondary" onClick={handleReview} disabled={acting}>
              <Eye size={14} /> Mark reviewed
            </Button>
          )}
          <Button variant="primary" onClick={handleResolve} disabled={acting}>
            <CheckCircle size={14} /> Resolve
          </Button>
        </div>
      )}

      {signal.status === "resolved" && (
        <div className="p-4 rounded-xl border border-accent-border bg-accent-soft">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-accent" />
            <span className="text-sm font-medium text-accent">Resolved</span>
            {signal.resolved_at && <span className="text-xs text-text-muted ml-auto">{formatRelativeTime(signal.resolved_at)}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
