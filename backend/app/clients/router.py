from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.policies import require_permission
from app.clients.schemas import ClientResponse, CreateClientRequest, UpdateClientRequest
from app.clients.service import create_client, delete_client, get_client, list_clients, update_client
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("", response_model=list[ClientResponse])
async def list_all(
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("clients", "read")),
):
    return await list_clients(db)


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create(
    body: CreateClientRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("clients", "create")),
):
    return await create_client(db, **body.model_dump())


@router.get("/{client_id}", response_model=ClientResponse)
async def get_one(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("clients", "read")),
):
    client = await get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=ClientResponse)
async def update(
    client_id: str,
    body: UpdateClientRequest,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("clients", "update")),
):
    client = await get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return await update_client(db, client, **body.model_dump(exclude_unset=True))


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    _user: User = Depends(require_permission("clients", "delete")),
):
    client = await get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    await delete_client(db, client)
