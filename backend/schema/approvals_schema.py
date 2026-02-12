# creating agent interaction schema
from pydantic import BaseModel
# saw a tiktok on how some people hack apis and learned about security
# in order to restrict users from entering any other type of status
# https://typing.python.org/en/latest/spec/literal.html
from typing import Literal


# creating approval schema
class SubmitApproval(BaseModel):
    status: Literal["Approved", "Rejected"]
    comments: str | None = None


class ResubmitApproval(BaseModel):
    status: str = "Pending"
    comments: str | None = None


class UpdateApproval(BaseModel):
    recipient_id: int
