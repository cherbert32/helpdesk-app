# importing created tables
from database.tables import Users, Agents

# importing the dependencies
from db_session import db_dependency, user_dependency, bcrypt_context, agent_dependency

# importing routing files
from schema.login import LoginSchema
from schema.user_schemas import CreateUser, EditUser, DeactivateUser, GetUser
from datetime import datetime, timedelta, timezone
from jose import jwt
# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
import os
from dotenv import load_dotenv

# loading .env file
load_dotenv()

# creating router
router = APIRouter(
    prefix='/users',
    tags=['users']
)

# grabbing data from
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')


# FastAPI below


def authenticate_user(email: str, password: str, db):
    user = db.query(Users).filter(Users.email == email).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.password):
        return False
    return user


def create_user_access_token(email: str, user_id: int, expires_delta: timedelta):
    encode = {
        'sub': email,
        'id': user_id,
        'role': 'user',
        'exp': datetime.now(timezone.utc) + expires_delta
    }
    return jwt.encode(encode, SECRET_KEY, ALGORITHM)


# user login credentials

@router.post("/user_login")
async def login_user(db: db_dependency, form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Either email or password are wrong."
        )
    if not user.active:
        raise HTTPException(
            status_code=401,
            detail="Something went wrong. Please reach out to our support team for more assistance."
        )
    token = create_user_access_token(
        email=user.email,
        user_id=user.id,
        expires_delta=timedelta(hours=4)
    )
    return {'access_token': token, 'token_type': 'bearer'}


# --------------------- Agent only routers below --------------------------
# getting all users
@router.get('/')
async def get_users(db: db_dependency, agent: agent_dependency):
    users = db.query(Users).order_by(Users.id).all()
    return users


# retrieving specific user
@router.get('/{user_id}')
async def get_user(user_id: int, db: db_dependency, agent: agent_dependency):
    user = db.query(Users).filter(Users.id == user_id).first()
    return user


# creating new user
@router.post("/user_creation")
async def make_user(create_user: CreateUser, db: db_dependency, agent: agent_dependency):

    # preventing users from having duplicate accounts
    duplicate = db.query(Users).filter(Users.email == create_user.email).first()
    if duplicate:
        raise HTTPException(status_code=403, detail="User email already in use.")
    hash_password = bcrypt_context.hash(create_user.password)

    new_user = Users(
        full_name=create_user.full_name,
        email=create_user.email,
        password=hash_password,
        division=create_user.division,
        program=create_user.program,
        employee_type=create_user.employee_type,
        supervisor_id=create_user.supervisor_id,
        active=True,
        created_by=agent["id"],
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User has been created."}


# updating specific user information
@router.put("/user_update/{user_id}")
async def update_user(user_id: int, edit_user: EditUser, db: db_dependency,  agent: agent_dependency):

    update = db.query(Users).filter(Users.id == user_id).first()
    if agent["agent_type"] != "admin":
        raise HTTPException(status_code=401, detail="Insufficient permission.")

    # only updating if form data is present
    if edit_user.full_name is not None:
        update.full_name = edit_user.full_name
    if edit_user.email is not None:
        update.email = edit_user.email
    if edit_user.password is not None:
        hash_password = bcrypt_context.hash(edit_user.password)
        update.password = hash_password
    if edit_user.division is not None:
        update.division = edit_user.division
    if edit_user.program is not None:
        update.program = edit_user.program
    if edit_user.employee_type is not None:
        update.employee_type = edit_user.employee_type
    if edit_user.supervisor_id is not None:
        update.supervisor_id = edit_user.supervisor_id
    if edit_user.active is not None:
        update.active = True
    update.updated_by = agent["id"]
    update.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(update)
    return {"message": "User successfully updated."}


# deactivating user
@router.put("/user_deactivation/{user_id}")
async def user_deactivation(user_id: int, db: db_dependency, agent: agent_dependency):
    deactivate = db.query(Users).filter(Users.id == user_id).first()

    deactivate.active = False
    deactivate.updated_by = agent["id"]
    deactivate.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(deactivate)
    return {"message": "User has been deactivated."}


# deleting user
@router.delete("/user_deletion/{user_id}")
async def user_deletion(user_id: int, db: db_dependency, agent: agent_dependency):
    delete = db.query(Users).filter(Users.id == user_id).first()
    db.delete(delete)
    db.commit()
    return {"message": "User has been deleted."}
