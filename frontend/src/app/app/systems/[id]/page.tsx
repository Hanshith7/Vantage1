"use client";

import { use } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";
import { Badge, Button, Skeleton, ErrorState, EmptyState } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { SystemDetail, Analytics, VantageEvent } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function SystemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: system, error: sysErr, isLoading: sysLoading, mutate: sysRetry } =
    useApi<SystemDetail>(() => api.systems.get(id), [id]);

  const { data: analytics, error: anaErr, isLoading: anaLoading } =
    useApi<Analytics>(() => api.systems.analytics(id), [id]);

  const { data: activity } = useApi<VantageEvent[]>(
    () => api.systems.activity(id, 20),
    [id]
  );

  if (sysLoading || anaLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (sysErr) return <ErrorState message={sysErr.message} onRetry={sysRetry} />;
  if (!system) return <EmptyState title="System not found" />;

  const isAttendance = system.type === "attendance";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <Link
          href="/app/systems"
          className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={12} /> Systems
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight uppercase">
            {system.name}
          </h1>
          <Badge variant={system.status === "connected" ? "green" : "red"}>
            {system.status}
          </Badge>
        </div>
        <p className="text-text-secondary text-sm mt-1">
          {system.description}
          {system.last_seen && (
            <span className="text-text-muted"> · Updated {formatRelativeTime(system.last_seen)}</span>
          )}
        </p>
      </div>

      {/* Primary metric */}
      {analytics && analytics.current_value !== null && analytics.current_value !== undefined && (
        <div className="p-6 rounded-xl bg-surface border border-border-subtle">
          <p className="text-xs font-medium tracking-widest text-text-muted uppercase mb-2">
            {isAttendance ? "Today's Attendance" : "Current Value"}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tracking-tight font-heading">
              {isAttendance
                ? `${analytics.current_value.toFixed(1)}%`
                : system.type === "database_health"
                ? `${analytics.current_value.toFixed(1)}ms`
                : analytics.current_value.toFixed(0)}
            </span>
            <span
              className="text-sm font-medium"
              style={{
                color:
                  analytics.status === "deviation"
                    ? "var(--signal-red)"
                    : "var(--accent-green)",
              }}
            >
              {analytics.status === "deviation"
                ? "Outside expected range"
                : "Within expected pattern"}
            </span>
          </div>
          {analytics.expected_min != null && analytics.expected_max != null && (
            <p className="text-xs text-text-muted mt-2">
              Expected range: {analytics.expected_min.toFixed(1)}–{analytics.expected_max.toFixed(1)}
              {isAttendance ? "%" : system.type === "database_health" ? "ms" : ""}
            </p>
          )}
        </div>
      )}

      {/* Trend chart */}
      {analytics?.trend && analytics.trend.length > 2 && (
        <div className="p-6 rounded-xl bg-surface border border-border-subtle">
          <p className="text-xs font-medium tracking-widest text-text-muted uppercase mb-4">
            Recent Trend
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trend}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-green)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--accent-green)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="timestamp"
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  hide
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                  }}
                  labelFormatter={() => ""}
                  formatter={(value: number) => [value.toFixed(1), "Value"]}
                />
                {analytics.expected_min != null && (
                  <ReferenceLine
                    y={analytics.expected_min}
                    stroke="var(--border-strong)"
                    strokeDasharray="4 4"
                  />
                )}
                {analytics.expected_max != null && (
                  <ReferenceLine
                    y={analytics.expected_max}
                    stroke="var(--border-strong)"
                    strokeDasharray="4 4"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--accent-green)"
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={(props: Record<string, unknown>) => {
                    const { cx, cy, payload } = props as {
                      cx: number;
                      cy: number;
                      payload: { value: number };
                    };
                    const isDeviation =
                      analytics.expected_min != null &&
                      analytics.expected_max != null &&
                      (payload.value < analytics.expected_min ||
                        payload.value > analytics.expected_max);
                    if (!isDeviation) return <circle key={`dot-${cx}`} cx={cx} cy={cy} r={0} />;
                    return (
                      <circle
                        key={`dot-${cx}`}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="var(--signal-red)"
                        stroke="var(--surface)"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Attendance drill-down */}
      {isAttendance && activity && activity.length > 0 && (
        <div className="p-6 rounded-xl bg-surface border border-border-subtle">
          <p className="text-xs font-medium tracking-widest text-text-muted uppercase mb-4">
            Section Breakdown
          </p>
          <div className="space-y-1">
            {(() => {
              // Group by entity_id (section)
              const sections = new Map<string, { value: number; status: string }>();
              activity.forEach((ev) => {
                if (ev.event_type === "attendance_recorded" && ev.value != null) {
                  if (!sections.has(ev.entity_id)) {
                    sections.set(ev.entity_id, {
                      value: ev.value,
                      status: ev.status,
                    });
                  }
                }
              });
              return Array.from(sections.entries()).map(([section, data]) => (
                <div
                  key={section}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-surface-hover/50 transition-colors"
                >
                  <span className="text-sm font-medium text-text-primary">{section}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text-secondary">
                      {data.value.toFixed(1)}%
                    </span>
                    <Badge
                      variant={data.status === "deviation" ? "red" : "green"}
                    >
                      {data.status === "deviation" ? "Review" : "Normal"}
                    </Badge>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Data quality */}
      {system.data_quality && (
        <div className="p-6 rounded-xl bg-surface border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium tracking-widest text-text-muted uppercase">
              Data Quality
            </p>
            <Badge variant="green">
              {(system.data_quality as Record<string, unknown>).completeness as number >= 95 ? "Good" : "Review"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-text-muted text-xs">Completeness</p>
              <p className="font-medium">{((system.data_quality as Record<string, unknown>).completeness as number)?.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Duplicates</p>
              <p className="font-medium">{(system.data_quality as Record<string, unknown>).duplicates as number}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Delayed</p>
              <p className="font-medium">{(system.data_quality as Record<string, unknown>).delayed as number}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Total Records</p>
              <p className="font-medium">{((system.data_quality as Record<string, unknown>).total_records as number)?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent activity */}
      {activity && activity.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-widest text-text-muted uppercase mb-4">
            Recent Activity
          </p>
          <div className="space-y-1">
            {activity.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-surface-raised/50 transition-colors"
              >
                <span className="text-xs text-text-muted w-16 shrink-0">
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
