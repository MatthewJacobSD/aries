from pydantic import BaseModel


class CreateJobRequest(BaseModel):
    name: str
    creator_id: str
    device_id: str
    type: str
    schedule: str = ""
    payload: dict = {}


class JobResponse(BaseModel):
    id: str
    name: str
    creator_id: str
    device_id: str
    type: str
    schedule: str
    payload: str
    status: str

    model_config = {"from_attributes": True}


class JobLogsResponse(BaseModel):
    logs: list[dict]
