# creating agent interaction schema
from pydantic import BaseModel
from datetime import datetime


# creating ticket schema
class CreateTicket(BaseModel):
    ticket_type_id: int
    sla_id: int
    group_id: int
    title: str
    description: str
    priority: str
    due_date: datetime


class UpdateTicket(BaseModel):
    user_id: int | None = None
    agent_id: int | None = None
    ticket_type_id: int | None = None
    sla_id: int | None = None
    group_id: int | None = None
    title: str | None = None
    description: str | None = None
    category: str | None = None
    subcategory: str | None = None
    ticket_status: str | None = None
    priority: str | None = None
    due_date: datetime| None = None