# creating login schema
from pydantic import BaseModel, EmailStr


# creating login schema
# EmailStr ensures that the email is an email
class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    token: str
    token_type: str
