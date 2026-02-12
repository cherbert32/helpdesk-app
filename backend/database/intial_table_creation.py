# this file was created to only initialize the creation of the tables

# importing required sqlalchemy files to begin table creation process
# this file is a one time use file
from sqlalchemy import create_engine

# importing Base class from tables.py
from database.tables import Base

# after watching some videos, found that the best approach is to have sensitive data in another file
# importing .env file and calling the required url for the ticketing system database connection
# importing os package to interact with loaded .env file
from dotenv import load_dotenv
import os

# instantiating .env file
load_dotenv()

# creating url object
url = os.getenv("url")

# creating engine and all tables
engine = create_engine(url)
Base.metadata.create_all(engine)

