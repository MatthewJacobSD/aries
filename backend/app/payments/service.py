import json

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payout import Payout
from app.models.invoice import Invoice


async def get_revenue_overview(db: AsyncSession) -> dict:
    total_payouts = (await db.execute(select(func.coalesce(func.sum(Payout.amount), 0)))).scalar()
    return {
        "gross": 0.0,
        "fees": 0.0,
        "net": 0.0,
        "outstanding": total_payouts,
    }


async def list_payouts(
    db: AsyncSession, page: int = 1, limit: int = 20, status: str | None = None
) -> dict:
    query = select(Payout)
    count_query = select(func.count(Payout.id))
    if status:
        query = query.where(Payout.status == status)
        count_query = count_query.where(Payout.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return {"items": result.scalars().all(), "total": total, "page": page, "limit": limit}


async def get_payout(db: AsyncSession, payout_id: str) -> Payout | None:
    result = await db.execute(select(Payout).where(Payout.id == payout_id))
    return result.scalar_one_or_none()


async def create_payout(db: AsyncSession, **kwargs) -> Payout:
    payout = Payout(**kwargs)
    db.add(payout)
    await db.commit()
    await db.refresh(payout)
    return payout


async def list_invoices(db: AsyncSession, page: int = 1, limit: int = 20) -> dict:
    query = select(Invoice)
    count_query = select(func.count(Invoice.id))
    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return {"items": result.scalars().all(), "total": total, "page": page, "limit": limit}


async def create_invoice(db: AsyncSession, **kwargs) -> Invoice:
    if "line_items" in kwargs and isinstance(kwargs["line_items"], list):
        kwargs["line_items"] = json.dumps(kwargs["line_items"])
    invoice = Invoice(**kwargs)
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return invoice
