from pydantic import BaseModel


class CreateClientRequest(BaseModel):
    name: str
    contact_email: str
    industry: str = ""
    status: str = "active"


class ClientResponse(BaseModel):
    id: str
    name: str
    contact_email: str
    industry: str
    status: str

    model_config = {"from_attributes": True}
