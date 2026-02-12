# creating agent interaction schema
from pydantic import BaseModel
from datetime import timedelta


# creating sla schema
class CreateSLA(BaseModel):
    sla_type: str
    first_response_time: timedelta
    resolution_time: timedelta


class UpdateSLA(BaseModel):
    sla_type: str | None = None
    first_response_time: timedelta | None = None
    resolution_time: timedelta | None = None



