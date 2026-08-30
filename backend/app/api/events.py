"""Events API endpoints."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Event
from app.schemas import EventOut

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventOut])
async def list_events(
    system_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    session: AsyncSession = Depends(get_session),
):
    query = select(Event).order_by(Event.timestamp.desc())

    if system_id:
        query = query.where(Event.system_id == system_id)
    if status:
        query = query.where(Event.status == status)

    query = query.limit(limit)
    result = await session.execute(query)
    events = result.scalars().all()
    return [EventOut.model_validate(e) for e in events]
