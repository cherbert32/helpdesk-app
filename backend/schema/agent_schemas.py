# creating agent interaction schema
from pydantic import BaseModel, EmailStr

# Authorized "admin" actions


class CreateAgent(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    agent_type: str
    group_id: int
    active: bool


class EditAgent(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    agent_type: str | None = None
    group_id: int | None = None
    active: bool | None = None


class DeactivateAgent(BaseModel):
    active: bool
