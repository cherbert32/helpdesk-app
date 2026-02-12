# importing routing files
from routers import users, agents, agent_notifications, feedback, groups, notifications, tickets, \
    ticket_types, ticket_SLA, ticket_history, ticket_approval, analytics

# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
app = FastAPI()


# grabbed the following code from fastapi documentation
# localhost:3000 port is our connection to next.js server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# FastAPI below

# uvicorn main:app --reload


# routers
app.include_router(agents.router)
app.include_router(users.router)
app.include_router(agent_notifications.router)
app.include_router(feedback.router)
app.include_router(groups.router)
app.include_router(notifications.router)
app.include_router(ticket_history.router)
app.include_router(ticket_approval.router)
app.include_router(tickets.router)
app.include_router(ticket_types.router)
app.include_router(ticket_SLA.router)
app.include_router(analytics.router)
