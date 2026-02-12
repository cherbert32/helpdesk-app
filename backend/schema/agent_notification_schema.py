# creating agent interaction schema
from pydantic import BaseModel


# Creating Notification schema
class CreateNotification(BaseModel):
    ticket_id: int
    agent_id: int
    read: bool
    message: str | None = None
