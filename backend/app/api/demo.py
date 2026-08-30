"""Demo scenario API endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.models import (
    System, Connector, Event, Baseline, Signal, DataQuality,
    SystemStatus, ConnectorStatus, SignalStatus, AttentionLevel,
)
from app.schemas import DemoStatus
from app.simulation.data_generator import DataGenerator

router = APIRouter(prefix="/demo", tags=["demo"])

# In-memory demo state
_demo_state = DemoStatus(active=False, current_scenario=None, scenario_name=None)

SCENARIO_NAMES = {
    1: "Normal activity",
    2: "Attendance drop",
    3: "System delay",
    4: "Correlated event",
    5: "Resolution",
}


async def _clear_all(session: AsyncSession):
    """Remove all data for a clean demo reset."""
    await session.execute(delete(Signal))
    await session.execute(delete(Event))
    await session.execute(delete(Baseline))
    await session.execute(delete(DataQuality))
    await session.execute(delete(Connector))
    await session.execute(delete(System))
    await session.flush()


async def _seed_systems(session: AsyncSession) -> dict[str, str]:
    """Create the 4 core systems and their connectors. Returns name->id map."""
    systems_data = [
        ("Attendance", "attendance", "Institutional attendance monitoring"),
        ("Student Portal", "student_portal", "Student portal activity tracking"),
        ("Faculty Services", "faculty", "Faculty services monitoring"),
        ("Database Health", "database_health", "System and database health monitoring"),
    ]
    id_map = {}
    now = datetime.now(timezone.utc)
    for name, sys_type, desc in systems_data:
        system = System(
            name=name,
            type=sys_type,
            status=SystemStatus.connected,
            description=desc,
            last_seen=now,
        )
        session.add(system)
        await session.flush()
        id_map[sys_type] = system.id

        connector = Connector(
            system_id=system.id,
            connector_type=f"{sys_type}_connector",
            status=ConnectorStatus.active,
            last_sync=now,
        )
        session.add(connector)

    await session.flush()
    return id_map


@router.get("/status", response_model=DemoStatus)
async def demo_status():
    return _demo_state


@router.post("/start", response_model=DemoStatus)
async def start_demo(session: AsyncSession = Depends(get_session)):
    """Initialize demo mode with clean data and normal scenario."""
    global _demo_state
    await _clear_all(session)

    id_map = await _seed_systems(session)
    gen = DataGenerator()

    # Generate normal historical data + baselines
    events, baselines, quality = gen.generate_normal_scenario(id_map)

    for event in events:
        session.add(Event(**event))
    for bl in baselines:
        session.add(Baseline(**bl))
    for dq in quality:
        session.add(DataQuality(**dq))

    # Update system event counts
    for sys_type, sys_id in id_map.items():
        sys_events = [e for e in events if e["system_id"] == sys_id]
        result = await session.execute(
            select(System).where(System.id == sys_id)
        )
        system = result.scalar_one()
        system.event_count = len(sys_events)

    await session.flush()

    _demo_state = DemoStatus(active=True, current_scenario=1, scenario_name="Normal activity")
    return _demo_state


@router.post("/reset", response_model=DemoStatus)
async def reset_demo(session: AsyncSession = Depends(get_session)):
    """Full reset - same as start."""
    return await start_demo(session=session)


@router.post("/scenario/{scenario}", response_model=DemoStatus)
async def run_scenario(
    scenario: int,
    session: AsyncSession = Depends(get_session),
):
    """Activate a demo scenario (1-5)."""
    global _demo_state

    if scenario not in SCENARIO_NAMES:
        from fastapi import HTTPException
        raise HTTPException(400, detail=f"Scenario must be 1-5, got {scenario}")

    if not _demo_state.active:
        await start_demo(session=session)

    # Get system IDs
    result = await session.execute(select(System))
    systems = {s.type: s.id for s in result.scalars().all()}

    gen = DataGenerator()

    if scenario == 1:
        # Normal - already seeded, just ensure no active signals
        await session.execute(delete(Signal))
        await session.flush()

    elif scenario == 2:
        # Attendance drop
        events, signal_data = gen.generate_attendance_drop(systems)
        for ev in events:
            session.add(Event(**ev))
        signal = Signal(**signal_data)
        session.add(signal)
        await session.flush()

    elif scenario == 3:
        # Database system delay
        events, signal_data = gen.generate_system_delay(systems)
        for ev in events:
            session.add(Event(**ev))
        signal = Signal(**signal_data)
        session.add(signal)
        await session.flush()

    elif scenario == 4:
        # Correlated event - DB spike then attendance drop
        all_events, all_signals = gen.generate_correlated_event(systems)
        for ev in all_events:
            session.add(Event(**ev))
        for sig in all_signals:
            session.add(Signal(**sig))
        await session.flush()

    elif scenario == 5:
        # Resolution - resolve all active signals
        sig_result = await session.execute(
            select(Signal).where(Signal.status != SignalStatus.resolved)
        )
        for sig in sig_result.scalars().all():
            sig.status = SignalStatus.resolved
            sig.resolved_at = datetime.now(timezone.utc)
            sig.resolved_by = "Admin"
            sig.trajectory = "resolved"
            sig.last_updated = datetime.now(timezone.utc)
        await session.flush()

    _demo_state = DemoStatus(
        active=True,
        current_scenario=scenario,
        scenario_name=SCENARIO_NAMES[scenario],
    )
    return _demo_state


@router.post("/resolve", response_model=DemoStatus)
async def resolve_demo(session: AsyncSession = Depends(get_session)):
    """Resolve all active signals."""
    return await run_scenario(5, session=session)
