"""Health check endpoint."""

from fastapi import APIRouter

from app.config import settings
from app.schemas import HealthOut

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthOut)
async def health_check():
    return HealthOut(
        status="ok",
        version="1.0.0",
        environment=settings.APP_ENV,
    )
