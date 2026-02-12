# importing required packages to created database session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# importing .env and os packages to safely access database credentials
from dotenv import load_dotenv
import os

# the following imports are additional imports from the following youtube video:
# https://www.youtube.com/watch?v=g566eI2EmeY

# Annotated allows use to enter additional information about our variables
from typing import Annotated
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status

# the OAuth2PasswordBearer is a class that we can import
# CryptContext is also a class we can import that encrypts
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError

# loading .env file and creating url object
load_dotenv()
url = os.getenv("url")

# creating database session
engine = create_engine(url)
DB_Session = sessionmaker(bind=engine)

# grabbing secret key and algorithm from my .env file
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')


# starting session

def start_db():
    db = DB_Session()
    try:
        yield db
    finally:
        db.close()


# the code below is derived from the following Youtube video as I am not familiar with 02auth
# I had the identified the need for this section as I realized that I needed a way to recognize users
# as they navigate through the app: https://www.youtube.com/watch?v=g566eI2EmeY


db_dependency = Annotated[Session, Depends(start_db)]

# bcrypt is a hashing algorithm that hides passwords
# the deprecated parameter identifies if the hashing algorithm has changed and auto updates itself

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

oauth2_agent_bearer = OAuth2PasswordBearer(tokenUrl='agents/agent_login')
oauth2_user_bearer = OAuth2PasswordBearer(tokenUrl='users/user_login')


oauth2_agent_dependency = Annotated[str, Depends(oauth2_agent_bearer)]
oauth2_user_dependency = Annotated[str, Depends(oauth2_user_bearer)]


# async allows our python script to run and not wait for a server response which is ideal due to the fact multiple
# routes could be running

# switched out username for email as user's username is an email


async def get_current_agent(token: oauth2_agent_dependency):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get('sub')
        agent_id: int = payload.get('id')
        role = payload.get('role')
        agent_type = payload.get('agent_type')

        if role != 'agent':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Not authorized as agent')
        if email is None or agent_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate user')
        return {'email': email, 'id': agent_id, 'agent_type': agent_type}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate user')


async def get_current_user(token: oauth2_user_dependency):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get('sub')
        user_id: int = payload.get('id')
        role = payload.get('role')

        if role != 'user':
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Not authorized as user')
        # if any of these are empty, then return 401 error that user could not fully identify
        if email is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate user')
        return {'email': email, 'id': user_id}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate user')


agent_dependency = Annotated[dict, Depends(get_current_agent)]
user_dependency = Annotated[dict, Depends(get_current_user)]
