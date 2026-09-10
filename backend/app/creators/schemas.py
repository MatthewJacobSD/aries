from pydantic import BaseModel


class CreateCreatorRequest(BaseModel):
    name: str
    platform: str
    handle: str
    email: str
    revenue_share: float = 0.7
    status: str = "active"


class UpdateCreatorRequest(BaseModel):
    name: str | None = None
    platform: str | None = None
    handle: str | None = None
    email: str | None = None
    revenue_share: float | None = None
    status: str | None = None


class CreatorResponse(BaseModel):
    id: str
    name: str
    platform: str
    handle: str
    email: str
    revenue_share: float
    status: str

    model_config = {"from_attributes": True}


class CreatorStatsResponse(BaseModel):
    id: str
    name: str
    total_revenue: float
    active_campaigns: int
    completed_campaigns: int
