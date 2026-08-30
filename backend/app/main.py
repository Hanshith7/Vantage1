"""Vantage backend — FastAPI application entry point."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.api import health, systems, events, signals, analytics, connectors, demo


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and seed demo data."""
    await init_db()
    yield


app = FastAPI(
    title="Vantage API",
    description="Institutional intelligence, made visible.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(health.router, prefix="/api")
app.include_router(systems.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(signals.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(connectors.router, prefix="/api")
app.include_router(demo.router, prefix="/api")
