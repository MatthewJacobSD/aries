from pydantic import BaseModel


class CreateTaskRequest(BaseModel):
    title: str
    campaign_id: str
    assigned_to: str = ""
    due_date: str = ""
    priority: str = "medium"
    status: str = "pending"


class UpdateTaskRequest(BaseModel):
    title: str | None = None
    campaign_id: str | None = None
    assigned_to: str | None = None
    due_date: str | None = None
    priority: str | None = None
    status: str | None = None


class TaskResponse(BaseModel):
    id: str
    title: str
    campaign_id: str
    assigned_to: str
    due_date: str
    priority: str
    status: str

    model_config = {"from_attributes": True}
