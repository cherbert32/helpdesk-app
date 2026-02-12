# creating agent interaction schema
from pydantic import BaseModel


# creating group schema
class CreateGroup(BaseModel):
    group_name: str


class UpdateGroup(BaseModel):
    group_name: str


