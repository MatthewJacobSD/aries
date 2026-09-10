from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.devices.schemas import (
    DeviceLogsResponse,
    DeviceResponse,
    RegisterDeviceRequest,
    UpdateDeviceStatusRequest,
)
from app.devices.service import (
    get_device,
    get_device_logs,
    list_devices,
    register_device,
    remove_device,
    update_device_status,
)

router = APIRouter(prefix="/api/devices", tags=["devices"])


@router.get("", response_model=dict)
async def list_all(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await list_devices(db, page, limit, status)


@router.post("", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterDeviceRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await register_device(db, **body.model_dump())


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_one(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    device = await get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.patch("/{device_id}/status", response_model=DeviceResponse)
async def update_status(
    device_id: str,
    body: UpdateDeviceStatusRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    device = await get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return await update_device_status(db, device, body.status)


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    device = await get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    await remove_device(db, device)


@router.get("/{device_id}/logs", response_model=DeviceLogsResponse)
async def logs(
    device_id: str,
    limit: int = Query(100, ge=1),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    device = await get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return DeviceLogsResponse(logs=await get_device_logs(device_id))
