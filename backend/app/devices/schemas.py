from pydantic import BaseModel


class RegisterDeviceRequest(BaseModel):
    name: str
    platform: str
    serial: str
    creator_id: str = ""
    status: str = "online"


class UpdateDeviceStatusRequest(BaseModel):
    status: str


class DeviceResponse(BaseModel):
    id: str
    name: str
    platform: str
    serial: str
    creator_id: str
    status: str

    model_config = {"from_attributes": True}


class DeviceLogsResponse(BaseModel):
    logs: list[dict]
