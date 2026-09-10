import json

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.payments.schemas import (
    CreateInvoiceRequest,
    CreatePayoutRequest,
    InvoiceResponse,
    PayoutResponse,
    RevenueOverviewResponse,
)
from app.payments.service import (
    create_invoice,
    create_payout,
    get_payout,
    get_revenue_overview,
    list_invoices,
    list_payouts,
)

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/revenue", response_model=RevenueOverviewResponse)
async def revenue(
    period: str = Query("monthly"),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await get_revenue_overview(db)


@router.get("/payouts", response_model=dict)
async def list_payouts_endpoint(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await list_payouts(db, page, limit, status)


@router.post("/payouts", response_model=PayoutResponse, status_code=status.HTTP_201_CREATED)
async def create_payout_endpoint(
    body: CreatePayoutRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await create_payout(db, **body.model_dump())


@router.get("/payouts/{payout_id}", response_model=PayoutResponse)
async def get_payout_endpoint(
    payout_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    payout = await get_payout(db, payout_id)
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    return payout


@router.get("/invoices", response_model=dict)
async def list_invoices_endpoint(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await list_invoices(db, page, limit)


@router.post("/invoices", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice_endpoint(
    body: CreateInvoiceRequest,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    return await create_invoice(db, **body.model_dump())


@router.post("/webhook")
async def stripe_webhook(request: Request):
    body = await request.json()
    return {"received": True, "type": body.get("type", "unknown")}
