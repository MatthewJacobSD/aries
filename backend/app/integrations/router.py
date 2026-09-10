from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.policies import require_permission
from app.database import get_db
from app.integrations.schemas import (
    ConnectFanvueRequest,
    ConnectTelegramRequest,
    FanvueStatsResponse,
    IntegrationResponse,
    SendTelegramRequest,
)
from app.integrations.service import (
    connect_integration,
    disconnect_integration,
    get_fanvue_stats,
    get_integration,
    get_integration_by_creator,
    list_integrations,
    send_telegram_message,
)
from app.models.user import User

router = APIRouter(prefix="/api/integrations", tags=["integrations"])


@router.get("", response_model=list[IntegrationResponse])
async def list_all(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("integrations", "read")),
):
    return await list_integrations(db)


@router.post("/fanvue", response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED)
async def connect_fanvue(
    body: ConnectFanvueRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("integrations", "create")),
):
    return await connect_integration(
        db,
        creator_id=body.creator_id,
        type="fanvue",
        config={"api_key": body.api_key, "username": body.username},
    )


@router.get("/fanvue/{creator_id}/stats", response_model=FanvueStatsResponse)
async def fanvue_stats(
    creator_id: str,
    _user: User = Depends(require_permission("integrations", "read")),
):
    return await get_fanvue_stats(creator_id)


@router.post("/telegram", response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED)
async def connect_telegram(
    body: ConnectTelegramRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("integrations", "create")),
):
    return await connect_integration(
        db,
        creator_id=body.creator_id,
        type="telegram",
        config={"bot_token": body.bot_token, "chat_id": body.chat_id},
    )


@router.post("/telegram/{creator_id}/send")
async def send_telegram(
    creator_id: str,
    body: SendTelegramRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("integrations", "create")),
):
    integration = await get_integration_by_creator(db, creator_id, "telegram")
    if not integration:
        raise HTTPException(status_code=404, detail="Telegram not connected for this creator")
    return await send_telegram_message(integration, body.message, body.parse_mode)


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect(
    integration_id: str,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("integrations", "delete")),
):
    integration = await get_integration(db, integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    await disconnect_integration(db, integration)
