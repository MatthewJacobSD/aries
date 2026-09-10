from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.clients.schemas import ClientResponse, CreateClientRequest
from app.clients.service import create_client, get_client, list_clients
from app.database import get_db

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("", response_model=list[ClientResponse])
async def list_all(
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await list_clients(db)


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create(
    body: CreateClientRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await create_client(db, **body.model_dump())


@router.get("/{client_id}", response_model=ClientResponse)
async def get_one(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    client = await get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client
