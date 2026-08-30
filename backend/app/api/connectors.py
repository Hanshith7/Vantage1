"""Connectors API endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import Connector, ConnectorStatus
from app.schemas import ConnectorOut, SyncResult

router = APIRouter(prefix="/connectors", tags=["connectors"])


@router.get("", response_model=list[ConnectorOut])
async def list_connectors(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Connector).order_by(Connector.created_at)
    )
    connectors = result.scalars().all()
    return [ConnectorOut.model_validate(c) for c in connectors]


@router.post("/{connector_id}/sync", response_model=SyncResult)
async def sync_connector(
    connector_id: str,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Connector).where(Connector.id == connector_id)
    )
    connector = result.scalar_one_or_none()
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")

    # Simulate sync
    connector.status = ConnectorStatus.active
    connector.last_sync = datetime.now(timezone.utc)
    await session.flush()

    return SyncResult(
        connector_id=connector_id,
        status="synced",
        events_processed=0,
        message="Sync completed successfully",
    )
