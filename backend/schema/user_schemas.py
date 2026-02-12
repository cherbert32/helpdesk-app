# creating agent interaction schema
from pydantic import BaseModel, EmailStr
from datetime import datetime


# create user schema
class GetUser(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    password: str
    division: str
    program: str
    employee_type: str
    supervisor_id: int
    active: bool
    created_by: int
    created_at: datetime
    updated_by: int
    updated_at: datetime


class CreateUser(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    division: str
    program: str
    employee_type: str
    supervisor_id: int


class EditUser(BaseModel):
    full_name: str | None = None
    email: EmailStr
    password: str
    division: str | None = None
    program: str | None = None
    employee_type: str | None = None
    supervisor_id: int | None = None
    active: bool


class DeactivateUser(BaseModel):
    id: int
    active: bool
    updated_by: int
