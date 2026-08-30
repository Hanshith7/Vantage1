"use client";

import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";
import { Badge, Button, Skeleton, ErrorState } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import type { Connector } from "@/types";
import { useState } from "react";

export default function SettingsPage() {
  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Workspace configuration and connector management.</p>
      </div>

      {/* Workspace */}
      <section className="p-6 rounded-xl bg-surface border border-border-subtle">
        <h2 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-4">Workspace</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">Institution</label>
            <p className="text-sm text-text-primary">Vantage Demo Institution</p>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Environment</label>
            <Badge variant="amber">Prototype</Badge>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Version</label>
            <p className="text-sm text-text-secondary">1.0.0</p>
          </div>
        </div>
      </section>

      {/* Connectors */}
      <ConnectorsSection />

      {/* Appearance */}
      <section className="p-6 rounded-xl bg-surface border border-border-subtle">
        <h2 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Dark mode</p>
            <p className="text-xs text-text-muted">Primary experience. Light mode coming soon.</p>
          </div>
          <Badge variant="green">Active</Badge>
        </div>
      </section>
    </div>
  );
}

function ConnectorsSection() {
  const { data, error, isLoading, mutate } = useApi<Connector[]>(() => api.connectors.list(), []);
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleSync = async (id: string) => {
    setSyncing(id);
    try { await api.connectors.sync(id); mutate(); } catch {} finally { setSyncing(null); }
  };

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (error) return <ErrorState message={error.message} onRetry={mutate} />;

  return (
    <section className="p-6 rounded-xl bg-surface border border-border-subtle">
      <h2 className="text-xs font-medium tracking-widest text-text-muted uppercase mb-4">Connectors</h2>
      {!data || data.length === 0 ? (
        <p className="text-sm text-text-muted">No connectors configured. Start demo mode to see connectors.</p>
      ) : (
        <div className="space-y-3">
          {data.map(conn => (
            <div key={conn.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-surface-raised/50">
              <div>
                <p className="text-sm font-medium text-text-primary">{conn.connector_type.replace("_connector", "").replace("_", " ")}</p>
                <p className="text-xs text-text-muted">{conn.last_sync ? `Last sync: ${formatRelativeTime(conn.last_sync)}` : "Never synced"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={conn.status === "active" ? "green" : conn.status === "error" ? "red" : "neutral"}>{conn.status}</Badge>
                <Button variant="ghost" size="sm" onClick={() => handleSync(conn.id)} disabled={syncing === conn.id}>
                  <RefreshCw size={12} className={syncing === conn.id ? "animate-spin" : ""} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
