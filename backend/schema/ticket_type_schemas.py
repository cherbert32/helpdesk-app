# creating agent interaction schema
from pydantic import BaseModel


# creating ticket type schema
class CreateTicketType(BaseModel):
    group_id: int
    sla_id: int
    type_name: str
    category: str
    sub_category: str
    require_intake_form: bool


class UpdateTicketType(BaseModel):
    group_id: int | None = None
    sla_id: int | None = None
    type_name: str | None = None
    category: str | None = None
    sub_category: str | None = None
    require_intake_form: bool | None = None
