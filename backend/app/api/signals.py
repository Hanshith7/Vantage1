"""Signals API endpoints."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Signal, System, SignalStatus
from app.schemas import SignalOut, SignalAction

router = APIRouter(prefix="/signals", tags=["signals"])


def _enrich_signal(signal: Signal, system_name: str | None = None) -> SignalOut:
    data = SignalOut.model_validate(signal)
    data.system_name = system_name
    return data


@router.get("", response_model=list[SignalOut])
async def list_signals(
    status: Optional[str] = Query(None),
    attention_level: Optional[str] = Query(None),
    system_id: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    session: AsyncSession = Depends(get_session),
):
    query = select(Signal).order_by(Signal.first_detected.desc())

    if status:
        query = query.where(Signal.status == status)
    if attention_level:
        query = query.where(Signal.attention_level == attention_level)
    if system_id:
        query = query.where(Signal.system_id == system_id)

    query = query.limit(limit)
    result = await session.execute(query)
    signals = result.scalars().all()

    # Enrich with system names
    enriched = []
    for s in signals:
        sys_result = await session.execute(
            select(System.name).where(System.id == s.system_id)
        )
        sys_name = sys_result.scalar_one_or_none()
        enriched.append(_enrich_signal(s, sys_name))

    return enriched


@router.get("/{signal_id}", response_model=SignalOut)
async def get_signal(signal_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Signal).where(Signal.id == signal_id)
    )
    signal = result.scalar_one_or_none()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")

    sys_result = await session.execute(
        select(System.name).where(System.id == signal.system_id)
    )
    sys_name = sys_result.scalar_one_or_none()
    return _enrich_signal(signal, sys_name)


@router.post("/{signal_id}/review", response_model=SignalOut)
async def review_signal(
    signal_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Signal).where(Signal.id == signal_id)
    )
    signal = result.scalar_one_or_none()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")

    signal.status = SignalStatus.under_review
    signal.last_updated = datetime.now(timezone.utc)
    await session.flush()

    sys_result = await session.execute(
        select(System.name).where(System.id == signal.system_id)
    )
    sys_name = sys_result.scalar_one_or_none()
    return _enrich_signal(signal, sys_name)


@router.post("/{signal_id}/resolve", response_model=SignalOut)
async def resolve_signal(
    signal_id: str,
    body: SignalAction | None = None,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Signal).where(Signal.id == signal_id)
    )
    signal = result.scalar_one_or_none()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")

    now = datetime.now(timezone.utc)
    signal.status = SignalStatus.resolved
    signal.resolved_at = now
    signal.last_updated = now
    signal.trajectory = "resolved"

    if body:
        if body.resolved_by:
            signal.resolved_by = body.resolved_by
        if body.note:
            signal.notes = body.note

    await session.flush()

    sys_result = await session.execute(
        select(System.name).where(System.id == signal.system_id)
    )
    sys_name = sys_result.scalar_one_or_none()
    return _enrich_signal(signal, sys_name)
