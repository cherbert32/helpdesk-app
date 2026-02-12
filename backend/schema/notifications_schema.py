# creating agent interaction schema
from pydantic import BaseModel


# creating user notification schema
class CreateNotification(BaseModel):
    ticket_id: int
    user_id: int
    read: bool
    message: str
