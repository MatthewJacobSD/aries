from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device


async def list_devices(
    db: AsyncSession, page: int = 1, limit: int = 20, status: str | None = None
) -> dict:
    query = select(Device)
    count_query = select(func.count(Device.id))
    if status:
        query = query.where(Device.status == status)
        count_query = count_query.where(Device.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return {"items": result.scalars().all(), "total": total, "page": page, "limit": limit}


async def get_device(db: AsyncSession, device_id: str) -> Device | None:
    result = await db.execute(select(Device).where(Device.id == device_id))
    return result.scalar_one_or_none()


async def register_device(db: AsyncSession, **kwargs) -> Device:
    device = Device(**kwargs)
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return device


async def update_device_status(db: AsyncSession, device: Device, status: str) -> Device:
    device.status = status
    await db.commit()
    await db.refresh(device)
    return device


async def remove_device(db: AsyncSession, device: Device) -> None:
    await db.delete(device)
    await db.commit()


async def get_device_logs(device_id: str) -> list[dict]:
    return []
