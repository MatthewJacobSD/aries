from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.creator import Creator


async def list_creators(
    db: AsyncSession, page: int = 1, limit: int = 20, status: str | None = None
) -> dict:
    query = select(Creator)
    count_query = select(func.count(Creator.id))
    if status:
        query = query.where(Creator.status == status)
        count_query = count_query.where(Creator.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    return {"items": items, "total": total, "page": page, "limit": limit}


async def get_creator(db: AsyncSession, creator_id: str) -> Creator | None:
    result = await db.execute(select(Creator).where(Creator.id == creator_id))
    return result.scalar_one_or_none()


async def create_creator(db: AsyncSession, **kwargs) -> Creator:
    creator = Creator(**kwargs)
    db.add(creator)
    await db.commit()
    await db.refresh(creator)
    return creator


async def update_creator(db: AsyncSession, creator: Creator, **kwargs) -> Creator:
    for key, value in kwargs.items():
        if value is not None:
            setattr(creator, key, value)
    await db.commit()
    await db.refresh(creator)
    return creator


async def delete_creator(db: AsyncSession, creator: Creator) -> None:
    await db.delete(creator)
    await db.commit()


async def get_creator_stats(db: AsyncSession, creator: Creator) -> dict:
    return {
        "id": creator.id,
        "name": creator.name,
        "total_revenue": 0.0,
        "active_campaigns": 0,
        "completed_campaigns": 0,
    }
