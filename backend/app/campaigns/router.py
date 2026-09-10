from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.campaigns.schemas import (
    CampaignResponse,
    CreateCampaignRequest,
    UpdateCampaignRequest,
)
from app.campaigns.service import (
    create_campaign,
    delete_campaign,
    get_campaign,
    list_campaigns,
    update_campaign,
)
from app.database import get_db

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


@router.get("", response_model=dict)
async def list_all(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await list_campaigns(db, page, limit, status)


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create(
    body: CreateCampaignRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await create_campaign(db, **body.model_dump())


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_one(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    campaign = await get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update(
    campaign_id: str,
    body: UpdateCampaignRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    campaign = await get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return await update_campaign(db, campaign, **body.model_dump(exclude_unset=True))


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    campaign = await get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    await delete_campaign(db, campaign)
