from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task


async def list_tasks(
    db: AsyncSession, page: int = 1, limit: int = 20, status: str | None = None
) -> dict:
    query = select(Task)
    count_query = select(func.count(Task.id))
    if status:
        query = query.where(Task.status == status)
        count_query = count_query.where(Task.status == status)
    total = (await db.execute(count_query)).scalar() or 0
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return {"items": result.scalars().all(), "total": total, "page": page, "limit": limit}


async def get_task(db: AsyncSession, task_id: str) -> Task | None:
    result = await db.execute(select(Task).where(Task.id == task_id))
    return result.scalar_one_or_none()


async def create_task(db: AsyncSession, **kwargs) -> Task:
    task = Task(**kwargs)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


async def update_task(db: AsyncSession, task: Task, **kwargs) -> Task:
    for key, value in kwargs.items():
        if value is not None:
            setattr(task, key, value)
    await db.commit()
    await db.refresh(task)
    return task
