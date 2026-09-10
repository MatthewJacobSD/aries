from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.campaign import Campaign


async def list_campaigns(
    db: AsyncSession, page: int = 1, limit: int = 20, status: str | None = None
) -> dict:
    query = select(Campaign)
    count_query = select(func.count(Campaign.id))
    if status:
        query = query.where(Campaign.status == status)
        count_query = count_query.where(Campaign.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return {"items": result.scalars().all(), "total": total, "page": page, "limit": limit}


async def get_campaign(db: AsyncSession, campaign_id: str) -> Campaign | None:
    result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
    return result.scalar_one_or_none()


async def create_campaign(db: AsyncSession, **kwargs) -> Campaign:
    if "creator_ids" in kwargs and isinstance(kwargs["creator_ids"], list):
        import json
        kwargs["creator_ids"] = json.dumps(kwargs["creator_ids"])
    campaign = Campaign(**kwargs)
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return campaign


async def update_campaign(db: AsyncSession, campaign: Campaign, **kwargs) -> Campaign:
    if "creator_ids" in kwargs and isinstance(kwargs["creator_ids"], list):
        import json
        kwargs["creator_ids"] = json.dumps(kwargs["creator_ids"])
    for key, value in kwargs.items():
        if value is not None:
            setattr(campaign, key, value)
    await db.commit()
    await db.refresh(campaign)
    return campaign


async def delete_campaign(db: AsyncSession, campaign: Campaign) -> None:
    await db.delete(campaign)
    await db.commit()
