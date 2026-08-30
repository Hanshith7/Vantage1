"""SQLAlchemy ORM models for Vantage."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    JSON,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_uuid() -> str:
    return str(uuid.uuid4())


# ── Enums ─────────────────────────────────────────────────────────────


class SystemStatus(str, enum.Enum):
    connected = "connected"
    disconnected = "disconnected"
    degraded = "degraded"
    error = "error"


class ConnectorStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    syncing = "syncing"
    error = "error"


class AttentionLevel(str, enum.Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    critical = "critical"


class SignalStatus(str, enum.Enum):
    detected = "detected"
    developing = "developing"
    needs_attention = "needs_attention"
    under_review = "under_review"
    resolved = "resolved"


# ── Models ────────────────────────────────────────────────────────────


class System(Base):
    __tablename__ = "systems"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[SystemStatus] = mapped_column(
        Enum(SystemStatus), default=SystemStatus.connected
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    event_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # Relationships
    connectors: Mapped[list["Connector"]] = relationship(back_populates="system", lazy="selectin")
    events: Mapped[list["Event"]] = relationship(back_populates="system", lazy="noload")
    baselines: Mapped[list["Baseline"]] = relationship(back_populates="system", lazy="noload")
    signals: Mapped[list["Signal"]] = relationship(back_populates="system", lazy="noload")
    data_quality: Mapped[list["DataQuality"]] = relationship(back_populates="system", lazy="noload")


class Connector(Base):
    __tablename__ = "connectors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    system_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("systems.id"), nullable=False
    )
    connector_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[ConnectorStatus] = mapped_column(
        Enum(ConnectorStatus), default=ConnectorStatus.active
    )
    last_sync: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    event_count: Mapped[int] = mapped_column(Integer, default=0)
    config_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )

    # Relationships
    system: Mapped["System"] = relationship(back_populates="connectors")


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    system_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("systems.id"), nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="normal")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    normalized_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )

    # Relationships
    system: Mapped["System"] = relationship(back_populates="events")


class Baseline(Base):
    __tablename__ = "baselines"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    system_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("systems.id"), nullable=False
    )
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    context: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    expected_min: Mapped[float] = mapped_column(Float, nullable=False)
    expected_max: Mapped[float] = mapped_column(Float, nullable=False)
    mean: Mapped[float] = mapped_column(Float, nullable=False)
    std_dev: Mapped[float] = mapped_column(Float, default=0.0)
    sample_count: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # Relationships
    system: Mapped["System"] = relationship(back_populates="baselines")


class Signal(Base):
    __tablename__ = "signals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    system_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("systems.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    attention_level: Mapped[AttentionLevel] = mapped_column(
        Enum(AttentionLevel), default=AttentionLevel.low
    )
    status: Mapped[SignalStatus] = mapped_column(
        Enum(SignalStatus), default=SignalStatus.detected
    )
    first_detected: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )
    explanation: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    related_events: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    deviation_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    trajectory: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    system: Mapped["System"] = relationship(back_populates="signals")


class DataQuality(Base):
    __tablename__ = "data_quality"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_uuid)
    system_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("systems.id"), nullable=False
    )
    completeness: Mapped[float] = mapped_column(Float, default=100.0)
    duplicates: Mapped[int] = mapped_column(Integer, default=0)
    delayed: Mapped[int] = mapped_column(Integer, default=0)
    invalid: Mapped[int] = mapped_column(Integer, default=0)
    total_records: Mapped[int] = mapped_column(Integer, default=0)
    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )

    # Relationships
    system: Mapped["System"] = relationship(back_populates="data_quality")
