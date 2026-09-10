from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client


async def list_clients(db: AsyncSession) -> list[Client]:
    result = await db.execute(select(Client))
    return list(result.scalars().all())


async def get_client(db: AsyncSession, client_id: str) -> Client | None:
    result = await db.execute(select(Client).where(Client.id == client_id))
    return result.scalar_one_or_none()


async def create_client(db: AsyncSession, **kwargs) -> Client:
    client = Client(**kwargs)
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client
