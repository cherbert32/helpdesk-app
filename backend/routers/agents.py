# importing created tables
from database.tables import Agents

# importing dependencies
from db_session import db_dependency, agent_dependency, bcrypt_context

# importing routing files
from schema.login import LoginSchema
from schema.agent_schemas import CreateAgent, EditAgent, DeactivateAgent
from datetime import datetime, timedelta, timezone
from jose import jwt
# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from dotenv import load_dotenv

import os

# loading .env files
load_dotenv()

# creating router
router = APIRouter(
    prefix='/agents',
    tags=['agents']
)

# grabbing data from .env file
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')


# FastAPI below


# authenticating agent
def authenticate_agent(email: str, password: str, db):
    agent = db.query(Agents).filter(Agents.email == email).first()
    if not agent:
        return False
    if not bcrypt_context.verify(password, agent.password):
        return False
    return agent


# creating agent token
def create_agent_access_token(email: str, agent_id: int, role: str, agent_type: str, expires_delta: timedelta):
    encode = {
        'sub': email,
        'id': agent_id,
        'role': "agent",
        'agent_type': agent_type,
        'exp': datetime.now(timezone.utc) + expires_delta
    }
    return jwt.encode(encode, SECRET_KEY, ALGORITHM)


# agent login credentials

@router.post("/agent_login")
async def login_agent( db: db_dependency, form_data: OAuth2PasswordRequestForm = Depends()):
    # retrieving current agent
    agent = authenticate_agent(form_data.username, form_data.password, db)
    if not agent:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Either email or password are wrong."
        )
    # create token
    token = create_agent_access_token(
        email=agent.email,
        agent_id=agent.id,
        role="agent",
        agent_type=agent.agent_type,
        expires_delta=timedelta(hours=4)
    )
    # return agent token
    return {'access_token': token, 'token_type': 'bearer'}


# get a list of all agents
@router.get('/')
async def get_agents(db: db_dependency, agent: agent_dependency):
    agents = db.query(Agents).all()
    return agents


# get specific agent
@router.get('/{agent_id}')
async def get_agent(agent_id: int, db: db_dependency, agent: agent_dependency):
    agent_1 = db.query(Agents).filter(Agents.id == agent_id).first()
    return agent_1


# create agent; must be admin
@router.post("/agent_creation")
async def make_agent(create_agent: CreateAgent, db: db_dependency, agent: agent_dependency):
    # checks to see if the agent has sufficient permissions to create
    if agent["agent_type"] != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permission.")
    # preventing agents from having duplicate accounts
    duplicate = db.query(Agents).filter(Agents.email == create_agent.email).first()
    if duplicate:
        raise HTTPException(status_code=403, detail="Agent email already in use.")
    hash_password = bcrypt_context.hash(create_agent.password)

    # new agent object
    new_agent = Agents(
        full_name=create_agent.full_name,
        email=create_agent.email,
        password=hash_password,
        agent_type=create_agent.agent_type,
        group_id=create_agent.group_id,
        active=True,
        created_by=agent["id"]
    )
    # committing changes
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return {"message": "Agent has been created."}


# updating agent information; must be admin
@router.put("/agent_update/{agent_id}")
async def update_agent(agent_id: int, edit_agent: EditAgent, db: db_dependency, agent: agent_dependency):
    update = db.query(Agents).filter(Agents.id == agent_id).first()
    if agent["agent_type"] != "admin":
        raise HTTPException(status_code=401, detail="Insufficient permission.")

    # only updates if information is found
    if edit_agent.full_name is not None:
        update.full_name = edit_agent.full_name
    if edit_agent.email is not None:
        update.email = edit_agent.email
    if edit_agent.password is not None:
        hash_password = bcrypt_context.hash(edit_agent.password)
        update.password = hash_password
    if edit_agent.agent_type is not None:
        update.agent_type = edit_agent.agent_type
    if edit_agent.group_id is not None:
        update.group_id = edit_agent.group_id
    if edit_agent.active is not None:
        update.active = edit_agent.active
    update.updated_by = agent["id"]
    update.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(update)
    return {"message": "Agent successfully updated."}


# agent deactivation; must be admin
@router.put("/agent_deactivation/{agent_id}")
async def agent_deactivation(agent_id: int, db: db_dependency, agent: agent_dependency):
    deactivate = db.query(Agents).filter(Agents.id == agent_id).first()
    if agent["agent_type"] != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permission.")
    deactivate.active = False
    deactivate.updated_by = agent["id"]
    deactivate.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(deactivate)
    return {"message": "Agent has been deactivated."}


# agent deletion; must be admin
@router.delete("/agent_deletion/{agent_id}")
async def agent_deletion(agent_id: int, db: db_dependency, agent: agent_dependency):
    delete = db.query(Agents).filter(Agents.id == agent_id).first()
    if agent["agent_type"] != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permission.")
    db.delete(delete)
    db.commit()
    return {"message": "Agent has been deleted."}
