# creating agent interaction schema
from pydantic import BaseModel
from datetime import datetime


# creating history schema
class AgentComment(BaseModel):
    ticket_id: int
    message: str
    is_private: bool


class UserComment(BaseModel):
    ticket_id: int
    message: str
    user_id: int

