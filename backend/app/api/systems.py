"""Systems API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models import System, Event, Baseline, DataQuality, Signal
from app.schemas import (
    SystemOut,
    SystemDetail,
    EventOut,
    AnalyticsOut,
    BaselineOut,
    DataQualityOut,
    ConnectorOut,
)

router = APIRouter(prefix="/systems", tags=["systems"])


@router.get("", response_model=list[SystemOut])
async def list_systems(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(System).order_by(System.name))
    systems = result.scalars().all()
    return [SystemOut.model_validate(s) for s in systems]


@router.get("/{system_id}", response_model=SystemDetail)
async def get_system(system_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(System)
        .options(selectinload(System.connectors))
        .where(System.id == system_id)
    )
    system = result.scalar_one_or_none()
    if not system:
        raise HTTPException(status_code=404, detail="System not found")

    # Get latest data quality
    dq_result = await session.execute(
        select(DataQuality)
        .where(DataQuality.system_id == system_id)
        .order_by(DataQuality.checked_at.desc())
        .limit(1)
    )
    dq = dq_result.scalar_one_or_none()
    dq_dict = None
    if dq:
        dq_dict = DataQualityOut.model_validate(dq).model_dump()

    return SystemDetail(
        **SystemOut.model_validate(system).model_dump(),
        connectors=[ConnectorOut.model_validate(c) for c in system.connectors],
        data_quality=dq_dict,
    )


@router.get("/{system_id}/activity", response_model=list[EventOut])
async def get_system_activity(
    system_id: str,
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Event)
        .where(Event.system_id == system_id)
        .order_by(Event.timestamp.desc())
        .limit(limit)
    )
    events = result.scalars().all()
    return [EventOut.model_validate(e) for e in events]


@router.get("/{system_id}/analytics", response_model=AnalyticsOut)
async def get_system_analytics(
    system_id: str,
    session: AsyncSession = Depends(get_session),
):
    # Get system
    sys_result = await session.execute(
        select(System).where(System.id == system_id)
    )
    system = sys_result.scalar_one_or_none()
    if not system:
        raise HTTPException(status_code=404, detail="System not found")

    # Get baselines
    bl_result = await session.execute(
        select(Baseline).where(Baseline.system_id == system_id)
    )
    baselines = bl_result.scalars().all()

    # Get latest event value
    ev_result = await session.execute(
        select(Event)
        .where(Event.system_id == system_id)
        .order_by(Event.timestamp.desc())
        .limit(1)
    )
    latest_event = ev_result.scalar_one_or_none()

    # Get recent events for trend
    trend_result = await session.execute(
        select(Event)
        .where(Event.system_id == system_id)
        .order_by(Event.timestamp.desc())
        .limit(30)
    )
    trend_events = trend_result.scalars().all()

    current_value = latest_event.value if latest_event else None
    exp_min = baselines[0].expected_min if baselines else None
    exp_max = baselines[0].expected_max if baselines else None

    status = "normal"
    if current_value is not None and exp_min is not None and exp_max is not None:
        if current_value < exp_min or current_value > exp_max:
            status = "deviation"

    return AnalyticsOut(
        system_id=system_id,
        system_name=system.name,
        current_value=current_value,
        expected_min=exp_min,
        expected_max=exp_max,
        status=status,
        trend=[
            {"timestamp": e.timestamp.isoformat(), "value": e.value}
            for e in reversed(trend_events)
            if e.value is not None
        ],
        baselines=[BaselineOut.model_validate(b) for b in baselines],
    )
