from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.tasks.schemas import CreateTaskRequest, TaskResponse, UpdateTaskRequest
from app.tasks.service import create_task, get_task, list_tasks, update_task

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=dict)
async def list_all(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await list_tasks(db, page, limit, status)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create(
    body: CreateTaskRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await create_task(db, **body.model_dump())


@router.put("/{task_id}", response_model=TaskResponse)
async def update(
    task_id: str,
    body: UpdateTaskRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    task = await get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return await update_task(db, task, **body.model_dump(exclude_unset=True))
