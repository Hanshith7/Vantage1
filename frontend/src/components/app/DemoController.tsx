"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import api from "@/lib/api";
import { Button } from "@/components/ui";
import { Play, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import type { DemoStatus } from "@/types";

const SCENARIOS = [
  { id: 1, name: "Normal", desc: "All systems healthy" },
  { id: 2, name: "Attendance drop", desc: "CSE-3C drops to ~62%" },
  { id: 3, name: "System delay", desc: "Database response spike" },
  { id: 4, name: "Correlated", desc: "DB spike + attendance drop" },
  { id: 5, name: "Resolution", desc: "Resolve all signals" },
];

export default function DemoController() {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: status, mutate } = useApi<DemoStatus>(
    () => api.demo.status(),
    []
  );

  if (!status?.active) return null;

  const runScenario = async (n: number) => {
    setLoading(true);
    try {
      await api.demo.scenario(n);
      mutate();
      // Force page data refresh
      window.dispatchEvent(new Event("vantage:demo-update"));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setLoading(true);
    try {
      await api.demo.reset();
      mutate();
      window.dispatchEvent(new Event("vantage:demo-update"));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-surface-raised border border-border-subtle rounded-xl shadow-2xl overflow-hidden min-w-64">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent">Demo Mode</span>
            {status.scenario_name && (
              <span className="text-xs text-text-muted">
                · {status.scenario_name}
              </span>
            )}
          </div>
          {expanded ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronUp size={14} className="text-text-muted" />}
        </button>

        {/* Scenarios */}
        {expanded && (
          <div className="px-3 pb-3 space-y-1.5 border-t border-border-subtle pt-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => runScenario(s.id)}
                disabled={loading}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                  status.current_scenario === s.id
                    ? "bg-accent-soft text-accent border border-accent-border"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                } disabled:opacity-50`}
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-text-muted ml-1.5">— {s.desc}</span>
              </button>
            ))}
            <div className="pt-2 border-t border-border-subtle">
              <Button variant="ghost" size="sm" onClick={reset} disabled={loading} className="w-full">
                <RotateCcw size={12} /> Reset demo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
