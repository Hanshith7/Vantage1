"""Analytics and Insights API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import System, Signal, Baseline, Event, SignalStatus
from app.schemas import InsightOut, OverviewOut, OverviewStats, SignalOut, EventOut

router = APIRouter(tags=["analytics"])


@router.get("/overview", response_model=OverviewOut)
async def get_overview(session: AsyncSession = Depends(get_session)):
    # Connected systems count
    sys_result = await session.execute(select(func.count(System.id)))
    system_count = sys_result.scalar() or 0

    # Needs attention count
    attn_result = await session.execute(
        select(func.count(Signal.id)).where(
            Signal.status.in_([
                SignalStatus.needs_attention,
                SignalStatus.detected,
                SignalStatus.developing,
            ])
        )
    )
    attention_count = attn_result.scalar() or 0

    # Active signals (not resolved)
    active_result = await session.execute(
        select(func.count(Signal.id)).where(
            Signal.status != SignalStatus.resolved
        )
    )
    active_count = active_result.scalar() or 0

    # Latest event timestamp
    latest_result = await session.execute(
        select(Event.timestamp).order_by(Event.timestamp.desc()).limit(1)
    )
    last_updated = latest_result.scalar_one_or_none()

    # Top attention signals
    sig_result = await session.execute(
        select(Signal)
        .where(Signal.status != SignalStatus.resolved)
        .order_by(Signal.first_detected.desc())
        .limit(5)
    )
    signals = sig_result.scalars().all()

    enriched_signals = []
    for s in signals:
        sys_name_result = await session.execute(
            select(System.name).where(System.id == s.system_id)
        )
        sys_name = sys_name_result.scalar_one_or_none()
        sig_out = SignalOut.model_validate(s)
        sig_out.system_name = sys_name
        enriched_signals.append(sig_out)

    # Recent events
    ev_result = await session.execute(
        select(Event).order_by(Event.timestamp.desc()).limit(10)
    )
    recent_events = [EventOut.model_validate(e) for e in ev_result.scalars().all()]

    return OverviewOut(
        stats=OverviewStats(
            connected_systems=system_count,
            needs_attention=attention_count,
            active_signals=active_count,
            last_updated=last_updated,
        ),
        attention_signals=enriched_signals,
        recent_events=recent_events,
    )


@router.get("/insights", response_model=list[InsightOut])
async def get_insights(session: AsyncSession = Depends(get_session)):
    """Generate insights from baselines and recent signals."""
    insights: list[InsightOut] = []

    # Get all systems with their baselines
    systems_result = await session.execute(select(System))
    systems = systems_result.scalars().all()

    for system in systems:
        # Get baselines
        bl_result = await session.execute(
            select(Baseline).where(Baseline.system_id == system.id)
        )
        baselines = bl_result.scalars().all()

        # Get latest event
        ev_result = await session.execute(
            select(Event)
            .where(Event.system_id == system.id)
            .order_by(Event.timestamp.desc())
            .limit(1)
        )
        latest = ev_result.scalar_one_or_none()

        if not baselines or not latest:
            continue

        primary_bl = baselines[0]
        current_val = latest.value

        if current_val is None:
            continue

        # Determine trend direction
        trend_result = await session.execute(
            select(Event.value)
            .where(Event.system_id == system.id)
            .order_by(Event.timestamp.desc())
            .limit(5)
        )
        recent_values = [v for (v,) in trend_result.all() if v is not None]

        trend_direction = "stable"
        if len(recent_values) >= 3:
            if recent_values[0] > recent_values[-1]:
                trend_direction = "increasing"
            elif recent_values[0] < recent_values[-1]:
                trend_direction = "decreasing"

        # Status
        status = "normal"
        attention = "low"
        if current_val < primary_bl.expected_min:
            status = "below expected range"
            attention = "high"
        elif current_val > primary_bl.expected_max:
            status = "above expected range"
            attention = "moderate"

        description = f"Current activity is {status}."
        if status == "normal":
            description = "Current activity is within the expected range."

        exp_range = f"{primary_bl.expected_min:.1f}–{primary_bl.expected_max:.1f}"

        context_text = None
        if status != "normal":
            context_text = f"The current value of {current_val:.1f} is outside the expected range of {exp_range}."

        insights.append(InsightOut(
            id=f"insight-{system.id}",
            title=f"{system.name} activity pattern",
            description=description,
            system_name=system.name,
            observed_value=current_val,
            expected_range=exp_range,
            context=context_text,
            trend_direction=trend_direction,
            attention_level=attention,
        ))

    return insights
