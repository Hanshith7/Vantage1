"""Pydantic schemas for Vantage API request/response validation."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ── System Schemas ────────────────────────────────────────────────────


class SystemOut(BaseModel):
    id: str
    name: str
    type: str
    status: str
    description: Optional[str] = None
    last_seen: Optional[datetime] = None
    event_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SystemDetail(SystemOut):
    connectors: list[ConnectorOut] = []
    current_health: Optional[dict[str, Any]] = None
    data_quality: Optional[dict[str, Any]] = None


# ── Connector Schemas ─────────────────────────────────────────────────


class ConnectorOut(BaseModel):
    id: str
    system_id: str
    connector_type: str
    status: str
    last_sync: Optional[datetime] = None
    event_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class SyncResult(BaseModel):
    connector_id: str
    status: str
    events_processed: int = 0
    message: str = ""


# ── Event Schemas ─────────────────────────────────────────────────────


class EventOut(BaseModel):
    id: str
    system_id: str
    timestamp: datetime
    event_type: str
    entity_type: str
    entity_id: str
    value: Optional[float] = None
    status: str = "normal"
    description: Optional[str] = None
    normalized_data: Optional[dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EventCreate(BaseModel):
    system_id: str
    timestamp: datetime
    event_type: str
    entity_type: str
    entity_id: str
    value: Optional[float] = None
    status: str = "normal"
    description: Optional[str] = None
    normalized_data: Optional[dict[str, Any]] = None


# ── Signal Schemas ────────────────────────────────────────────────────


class SignalOut(BaseModel):
    id: str
    system_id: str
    system_name: Optional[str] = None
    title: str
    description: str
    attention_level: str
    status: str
    first_detected: datetime
    last_updated: datetime
    explanation: Optional[dict[str, Any]] = None
    related_events: Optional[list[dict[str, Any]]] = None
    deviation_score: Optional[float] = None
    trajectory: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class SignalAction(BaseModel):
    action: str = Field(..., pattern="^(review|resolve|note)$")
    note: Optional[str] = None
    resolved_by: Optional[str] = "Admin"


# ── Baseline Schemas ──────────────────────────────────────────────────


class BaselineOut(BaseModel):
    id: str
    system_id: str
    metric_name: str
    context: Optional[dict[str, Any]] = None
    expected_min: float
    expected_max: float
    mean: float
    std_dev: float
    sample_count: int = 0
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Analytics / Insights ──────────────────────────────────────────────


class AnalyticsOut(BaseModel):
    system_id: str
    system_name: str
    current_value: Optional[float] = None
    expected_min: Optional[float] = None
    expected_max: Optional[float] = None
    status: str = "normal"
    trend: Optional[list[dict[str, Any]]] = None
    baselines: list[BaselineOut] = []
    deviation: Optional[dict[str, Any]] = None


class InsightOut(BaseModel):
    id: str
    title: str
    description: str
    system_name: str
    observed_value: Optional[float] = None
    expected_range: Optional[str] = None
    context: Optional[str] = None
    trend_direction: Optional[str] = None
    attention_level: str = "low"


class DataQualityOut(BaseModel):
    system_id: str
    completeness: float = 100.0
    duplicates: int = 0
    delayed: int = 0
    invalid: int = 0
    total_records: int = 0
    status: str = "good"
    checked_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Overview ──────────────────────────────────────────────────────────


class OverviewStats(BaseModel):
    connected_systems: int = 0
    needs_attention: int = 0
    active_signals: int = 0
    last_updated: Optional[datetime] = None


class OverviewOut(BaseModel):
    stats: OverviewStats
    attention_signals: list[SignalOut] = []
    recent_events: list[EventOut] = []


# ── Demo ──────────────────────────────────────────────────────────────


class DemoStatus(BaseModel):
    active: bool = False
    current_scenario: Optional[int] = None
    scenario_name: Optional[str] = None


# ── Health ────────────────────────────────────────────────────────────


class HealthOut(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    environment: str = "development"
