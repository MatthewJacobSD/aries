from pydantic import BaseModel


class CreatePayoutRequest(BaseModel):
    creator_id: str
    amount: float
    currency: str = "usd"
    description: str = ""


class PayoutResponse(BaseModel):
    id: str
    creator_id: str
    amount: float
    currency: str
    description: str
    status: str

    model_config = {"from_attributes": True}


class RevenueOverviewResponse(BaseModel):
    gross: float
    fees: float
    net: float
    outstanding: float


class CreateInvoiceRequest(BaseModel):
    client_id: str
    campaign_id: str = ""
    amount: float
    currency: str = "usd"
    due_date: str = ""
    line_items: list[dict] = []


class InvoiceResponse(BaseModel):
    id: str
    client_id: str
    campaign_id: str
    amount: float
    currency: str
    due_date: str
    line_items: str
    status: str

    model_config = {"from_attributes": True}
