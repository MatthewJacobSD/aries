from pydantic import BaseModel


class ConnectFanvueRequest(BaseModel):
    creator_id: str
    api_key: str
    username: str


class ConnectTelegramRequest(BaseModel):
    creator_id: str
    bot_token: str
    chat_id: str


class SendTelegramRequest(BaseModel):
    message: str
    parse_mode: str = "HTML"


class IntegrationResponse(BaseModel):
    id: str
    creator_id: str
    type: str
    status: str
    config: str

    model_config = {"from_attributes": True}


class FanvueStatsResponse(BaseModel):
    subscribers: int
    revenue: float
