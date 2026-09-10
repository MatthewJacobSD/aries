from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.policies import require_permission
from app.database import get_db
from app.models.user import User
from app.tasks.schemas import CreateTaskRequest, TaskResponse, UpdateTaskRequest
from app.tasks.service import create_task, delete_task, get_task, list_tasks, update_task

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=dict)
async def list_all(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("tasks", "read")),
):
    return await list_tasks(db, page, limit, status)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_one(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("tasks", "read")),
):
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create(
    body: CreateTaskRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("tasks", "create")),
):
    return await create_task(db, **body.model_dump())


@router.put("/{task_id}", response_model=TaskResponse)
async def update(
    task_id: str,
    body: UpdateTaskRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("tasks", "update")),
):
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return await update_task(db, task, **body.model_dump(exclude_unset=True))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("tasks", "delete")),
):
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await delete_task(db, task)
