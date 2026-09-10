from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.policies import Role, require_permission
from app.creators.schemas import (
    CreateCreatorRequest,
    CreatorResponse,
    CreatorStatsResponse,
    UpdateCreatorRequest,
)
from app.creators.service import (
    create_creator,
    delete_creator,
    get_creator,
    get_creator_stats,
    list_creators,
    update_creator,
)
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/api/creators", tags=["creators"])


@router.get("", response_model=dict)
async def list_all(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("creators", "read")),
):
    return await list_creators(db, page, limit, status)


@router.post("", response_model=CreatorResponse, status_code=status.HTTP_201_CREATED)
async def create(
    body: CreateCreatorRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("creators", "create")),
):
    return await create_creator(db, **body.model_dump())


@router.get("/{creator_id}", response_model=CreatorResponse)
async def get_one(
    creator_id: str,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("creators", "read")),
):
    creator = await get_creator(db, creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return creator


@router.put("/{creator_id}", response_model=CreatorResponse)
async def update(
    creator_id: str,
    body: UpdateCreatorRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("creators", "update")),
):
    creator = await get_creator(db, creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return await update_creator(db, creator, **body.model_dump(exclude_unset=True))


@router.delete("/{creator_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    creator_id: str,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("creators", "delete")),
):
    creator = await get_creator(db, creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    await delete_creator(db, creator)


@router.get("/{creator_id}/stats", response_model=CreatorStatsResponse)
async def stats(
    creator_id: str,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("creators", "read")),
):
    creator = await get_creator(db, creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return await get_creator_stats(db, creator)
