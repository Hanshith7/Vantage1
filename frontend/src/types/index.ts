/* ── Vantage TypeScript Types ─────────────────────────────────────── */

export interface System {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "degraded" | "error";
  description?: string;
  last_seen?: string;
  event_count: number;
  created_at: string;
  updated_at: string;
}

export interface SystemDetail extends System {
  connectors: Connector[];
  current_health?: Record<string, unknown>;
  data_quality?: DataQuality;
}

export interface Connector {
  id: string;
  system_id: string;
  connector_type: string;
  status: "active" | "inactive" | "syncing" | "error";
  last_sync?: string;
  event_count: number;
  created_at: string;
}

export interface VantageEvent {
  id: string;
  system_id: string;
  timestamp: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  value?: number;
  status: string;
  description?: string;
  normalized_data?: Record<string, unknown>;
  created_at: string;
}

export interface Signal {
  id: string;
  system_id: string;
  system_name?: string;
  title: string;
  description: string;
  attention_level: "low" | "moderate" | "high" | "critical";
  status: "detected" | "developing" | "needs_attention" | "under_review" | "resolved";
  first_detected: string;
  last_updated: string;
  explanation?: {
    what_changed: string;
    why_noticed: string[];
    related_context: string[];
    current_state: string;
  };
  related_events?: Array<{ event_id: string; relationship: string }>;
  deviation_score?: number;
  trajectory?: string;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
}

export interface Baseline {
  id: string;
  system_id: string;
  metric_name: string;
  context?: Record<string, unknown>;
  expected_min: number;
  expected_max: number;
  mean: number;
  std_dev: number;
  sample_count: number;
  updated_at: string;
}

export interface Analytics {
  system_id: string;
  system_name: string;
  current_value?: number;
  expected_min?: number;
  expected_max?: number;
  status: string;
  trend?: Array<{ timestamp: string; value: number }>;
  baselines: Baseline[];
  deviation?: Record<string, unknown>;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  system_name: string;
  observed_value?: number;
  expected_range?: string;
  context?: string;
  trend_direction?: string;
  attention_level: string;
}

export interface OverviewStats {
  connected_systems: number;
  needs_attention: number;
  active_signals: number;
  last_updated?: string;
}

export interface Overview {
  stats: OverviewStats;
  attention_signals: Signal[];
  recent_events: VantageEvent[];
}

export interface DataQuality {
  system_id: string;
  completeness: number;
  duplicates: number;
  delayed: number;
  invalid: number;
  total_records: number;
  status: string;
  checked_at?: string;
}

export interface DemoStatus {
  active: boolean;
  current_scenario?: number;
  scenario_name?: string;
}

export interface Health {
  status: string;
  version: string;
  environment: string;
}
