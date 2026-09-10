from pydantic import BaseModel


class CreateCampaignRequest(BaseModel):
    name: str
    client_id: str
    creator_ids: list[str] = []
    budget: float = 0.0
    start_date: str = ""
    end_date: str = ""
    status: str = "draft"


class UpdateCampaignRequest(BaseModel):
    name: str | None = None
    client_id: str | None = None
    creator_ids: list[str] | None = None
    budget: float | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: str | None = None


class CampaignResponse(BaseModel):
    id: str
    name: str
    client_id: str
    creator_ids: str
    budget: float
    start_date: str
    end_date: str
    status: str

    model_config = {"from_attributes": True}
