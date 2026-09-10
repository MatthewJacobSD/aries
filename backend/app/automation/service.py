import json

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.automation_job import AutomationJob


async def list_jobs(
    db: AsyncSession, page: int = 1, limit: int = 20, status: str | None = None
) -> dict:
    query = select(AutomationJob)
    count_query = select(func.count(AutomationJob.id))
    if status:
        query = query.where(AutomationJob.status == status)
        count_query = count_query.where(AutomationJob.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return {"items": result.scalars().all(), "total": total, "page": page, "limit": limit}


async def get_job(db: AsyncSession, job_id: str) -> AutomationJob | None:
    result = await db.execute(select(AutomationJob).where(AutomationJob.id == job_id))
    return result.scalar_one_or_none()


async def create_job(db: AsyncSession, **kwargs) -> AutomationJob:
    if "payload" in kwargs and isinstance(kwargs["payload"], dict):
        kwargs["payload"] = json.dumps(kwargs["payload"])
    job = AutomationJob(**kwargs)
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


async def update_job_status(db: AsyncSession, job: AutomationJob, status: str) -> AutomationJob:
    job.status = status
    await db.commit()
    await db.refresh(job)
    return job


async def cancel_job(db: AsyncSession, job: AutomationJob) -> None:
    await db.delete(job)
    await db.commit()


async def get_job_logs(job_id: str) -> list[dict]:
    return []
