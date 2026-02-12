# creating agent interaction schema
from pydantic import BaseModel


# creating feedback schema
class CreateFeedback(BaseModel):
    rating: int
    comments: str



class EditFeedback(BaseModel):
    rating: int | None = None
    comments: str | None = None