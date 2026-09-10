import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.integration import Integration


async def list_integrations(db: AsyncSession) -> list[Integration]:
    result = await db.execute(select(Integration))
    return list(result.scalars().all())


async def get_integration(db: AsyncSession, integration_id: str) -> Integration | None:
    result = await db.execute(select(Integration).where(Integration.id == integration_id))
    return result.scalar_one_or_none()


async def get_integration_by_creator(db: AsyncSession, creator_id: str, type: str) -> Integration | None:
    result = await db.execute(
        select(Integration).where(Integration.creator_id == creator_id, Integration.type == type)
    )
    return result.scalar_one_or_none()


async def connect_integration(db: AsyncSession, **kwargs) -> Integration:
    if "config" in kwargs and isinstance(kwargs["config"], dict):
        kwargs["config"] = json.dumps(kwargs["config"])
    integration = Integration(**kwargs)
    db.add(integration)
    await db.commit()
    await db.refresh(integration)
    return integration


async def disconnect_integration(db: AsyncSession, integration: Integration) -> None:
    await db.delete(integration)
    await db.commit()


async def get_fanvue_stats(creator_id: str) -> dict:
    return {"subscribers": 0, "revenue": 0.0}


async def send_telegram_message(integration: Integration, message: str, parse_mode: str) -> dict:
    return {"sent": True, "message": message}
