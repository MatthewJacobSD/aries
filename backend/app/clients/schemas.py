from pydantic import BaseModel


class CreateClientRequest(BaseModel):
    name: str
    contact_email: str
    industry: str = ""
    status: str = "active"


class UpdateClientRequest(BaseModel):
    name: str | None = None
    contact_email: str | None = None
    industry: str | None = None
    status: str | None = None


class ClientResponse(BaseModel):
    id: str
    name: str
    contact_email: str
    industry: str
    status: str

    model_config = {"from_attributes": True}
