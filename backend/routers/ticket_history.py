# importing created tables
from database.tables import Ticket, TicketApprovals, Users, Agents, Notification, AgentNotification, TicketHistory

from datetime import datetime

# importing the session
from db_session import db_dependency, agent_dependency, user_dependency

# importing routing files
from schema.history_schema import AgentComment, UserComment

# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter, HTTPException

# creating router
router = APIRouter(
    prefix='/ticket_history',
    tags=['ticket_history']
)


# getting the ticket history
@router.get('/user/{ticket_id}')
async def ticket_history(ticket_id: int, db: db_dependency, user: user_dependency):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    ticket_requestor = db.query(Users).filter(Users.id == ticket.user_id).first()
    requestor_manager = db.query(Users).filter(Users.id == ticket_requestor.supervisor_id).first()
    requestor_deputy_director = db.query(Users).filter(Users.id == requestor_manager.supervisor_id).first()
    allowed_users = [
        ticket_requestor.id,
        requestor_manager.id,
        requestor_deputy_director.id
    ]
    if user["id"] not in allowed_users:
        raise HTTPException(status_code=403, detail="Access denied: Not authorized to view ticket history.")

    # only return non-private messages
    historical = db.query(TicketHistory).filter(TicketHistory.ticket_id == ticket.id, TicketHistory.is_private == False).all()
    return historical


# returning full ticket history
@router.get('/agent/{ticket_id}')
async def ticket_history(ticket_id: int, db: db_dependency, agent: agent_dependency):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    historical = db.query(TicketHistory).filter(TicketHistory.ticket_id == ticket.id).all()
    return historical


# creating comment: User
@router.post('/user_comment/{ticket_id}')
async def create_comment(ticket_id: int, user_comment: UserComment, db: db_dependency,
                         user: user_dependency):

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    ticket_requestor = db.query(Users).filter(Users.id == ticket.user_id).first()
    requestor_manager = db.query(Users).filter(Users.id == ticket_requestor.supervisor_id).first()
    requestor_deputy_director = db.query(Users).filter(Users.id == requestor_manager.supervisor_id).first()
    # only allowing the following users to view the ticket history through restrictions
    allowed_users = [
        ticket_requestor.id,
        requestor_manager.id,
        requestor_deputy_director.id
    ]
    if user["id"] not in allowed_users:
        raise HTTPException(status_code=403, detail="Access denied: Not authorized to view ticket history.")

    comment = TicketHistory(
        ticket_id=ticket.id,
        message=user_comment.message,
        created_at=datetime.utcnow(),
        user_id=user["id"]
    )
    # agent notified of new comment
    agent_notification = AgentNotification(
        ticket_id=ticket.id,
        agent_id=ticket.agent_id,
        message=f"Someone has commented on Ticket #{ticket.id}.",
        sent_at=datetime.utcnow()
    )
    db.add(agent_notification)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {"message": "User comment added successfully"}


# creating agent comment
@router.post('/agent_comment/{ticket_id}')
async def create_agent_comment(ticket_id: int, agent_comment: AgentComment, db: db_dependency,
                               agent: agent_dependency):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    ticket_requestor = db.query(Users).filter(Users.id == ticket.user_id).first()
    requestor_manager = db.query(Users).filter(Users.id == ticket_requestor.supervisor_id).first()
    requestor_deputy_director = db.query(Users).filter(Users.id == requestor_manager.supervisor_id).first()

    # sending notification to all users
    comment = TicketHistory(
        ticket_id=ticket.id,
        message=agent_comment.message,
        is_private=agent_comment.is_private,
        created_at=datetime.utcnow(),
        agent_id=agent["id"]
    )
    if ticket.first_response_time is not None and ticket.submitted_on is not None:
        if (ticket.first_response_time + ticket.submitted_on) > datetime.utcnow():
            ticket.first_response_time_delinquency = False
    else:
        ticket.first_response_time_delinquency = True
    requestor_notification = Notification(
        ticket_id=ticket.id,
        user_id=ticket_requestor.id,
        message=f"An agent commented on Ticket #{ticket.id}.",
        sent_at=datetime.utcnow()
    )
    manager_notification = Notification(
        ticket_id=ticket.id,
        user_id=requestor_manager.id,
        message=f"An agent commented on Ticket #{ticket.id}.",
        sent_at=datetime.utcnow()
    )
    deputy_director_notification = Notification(
        ticket_id=ticket.id,
        user_id=requestor_deputy_director.id,
        message=f"An agent commented on Ticket #{ticket.id}.",
        sent_at=datetime.utcnow()
    )
    db.add(requestor_notification)
    db.add(manager_notification)
    db.add(deputy_director_notification)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {"message": "Agent comment added successfully"}