# importing created tables
from database.tables import (Ticket, TicketApprovals, Users, Agents,
                             Notification, AgentNotification, Groups, TicketSLA, TicketType, Audits)

from datetime import datetime

# importing the session
from db_session import db_dependency, agent_dependency, user_dependency

# importing routing files
from schema.ticket_schema import CreateTicket, UpdateTicket

# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter, HTTPException

# creating router
router = APIRouter(
    prefix='/tickets',
    tags=['tickets']
)


# getting all tickets
@router.get('/agent/')
async def get_tickets_agent(db: db_dependency, agent: agent_dependency):
    tickets = db.query(Ticket).all()
    return tickets


# getting specific ticket details
@router.get('/agent/{ticket_id}')
async def get_ticket_agent(ticket_id: int, db: db_dependency, agent: agent_dependency):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    return ticket


# retrieving identified ticket
@router.get('/user/')
async def get_tickets_user(db: db_dependency, user: user_dependency):
    user = db.query(Users).filter(Users.id == user["id"]).first()
    tickets = None
    if user.employee_type == "Line Staff":
        tickets = db.query(Ticket).filter(Ticket.user_id == user.id).all()
    elif user.employee_type == "Manager":
        tickets = db.query(Ticket).filter(Ticket.program == user.program).all()
    elif user.employee_type == "Deputy Director":
        tickets = db.query(Ticket).filter(Ticket.division == user.division).all()
    return tickets


# getting specific ticket details
@router.get('/user/{ticket_id}')
async def get_ticket_user(ticket_id: int, db: db_dependency, user: user_dependency):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    current_user = db.query(Users).filter(Users.id == user["id"]).first()

    if current_user.employee_type == "Line Staff" and ticket.user_id != current_user.id:
        return HTTPException(status_code=403, detail="Unauthorized access to ticket.")
    if current_user.employee_type == "Manager" and ticket.program != current_user.program:
        return HTTPException(status_code=403, detail="Unauthorized access to ticket.")
    if current_user.employee_type == "Deputy Director" and ticket.division != current_user.division:
        return HTTPException(status_code=403, detail="Unauthorized access to ticket.")

    return ticket


@router.post('/user/create_ticket/')
async def ticket_creation(create_ticket: CreateTicket, db: db_dependency, user: user_dependency):
    user = db.query(Users).filter(Users.id == user["id"]).first()
    ticket_type = db.query(TicketType).filter(TicketType.id == create_ticket.ticket_type_id).first()
    ticket_sla = db.query(TicketSLA).filter(TicketSLA.id == create_ticket.sla_id).first()
    group = db.query(Groups).filter(Groups.id == create_ticket.group_id).first()
    # roundrobin assignment logic
    # first we retrieve all agents that part of that group and order them by creation order
    agents = db.query(Agents).filter(Agents.group_id == group.id, Agents.active == True).order_by(Agents.id).all()

    # get the total number of tickets assigned per group
    ticket_count_per_group = db.query(Ticket).filter(Ticket.group_id == group.id).count()

    # user modulo to get the remainder of ticket_count_per_group / len(agents)
    # for example, if there were 3 agents and 7 ticket: there is a remainder of 1. this ticket would then be assigned
    # to the second agent. When 0 remainder then the first, etc
    assigned_agent = agents[ticket_count_per_group%len(agents)]

    new_ticket = Ticket(
        user_id=user.id,
        agent_id=assigned_agent.id,
        ticket_type_id=ticket_type.id,
        sla_id=ticket_sla.id,
        group_id=group.id,
        title=create_ticket.title,
        description=create_ticket.description,
        category=ticket_type.category,
        subcategory=ticket_type.sub_category,
        ticket_status="Open",
        priority=create_ticket.priority,
        division=user.division,
        program=user.program,
        due_date=create_ticket.due_date,
        first_response_time=datetime.utcnow() + ticket_sla.first_response_time,
        resolution_time=datetime.utcnow() + ticket_sla.resolution_time,
        feedback_status="request",
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    # the code below starts the request approval that starts at ticket creation
    if user.employee_type == "Line Staff":
        recipient = db.query(Users).filter(Users.id == user.supervisor_id).first()
        start_request_approval = TicketApprovals(
            ticket_id=new_ticket.id,
            user_id=user.id,
            agent_id=assigned_agent.id,
            recipient_id=user.supervisor_id,
            role=recipient.employee_type,
            status = "Pending",
            approval_type = "request"
        )
        db.add(start_request_approval)

        request_notification = Notification(
            ticket_id=new_ticket.id,
            user_id=user.supervisor_id,
            message=f"Pending request approval request for ticket #{new_ticket.id}",
            sent_at=datetime.utcnow()
        )
        db.add(request_notification)
    if user.employee_type == "Manager":
        recipient = db.query(Users).filter(Users.id == user.supervisor_id).first()
        start_request_approval = TicketApprovals(
            ticket_id=new_ticket.id,
            user_id=user.id,
            agent_id=assigned_agent.id,
            recipient_id=user.supervisor_id,
            role=recipient.employee_type,
            status="Pending",
            approval_type="request"
        )
        db.add(start_request_approval)

        request_notification = Notification(
            ticket_id=new_ticket.id,
            user_id=user.supervisor_id,
            message=f"Pending request approval request for ticket #{new_ticket.id}",
            sent_at=datetime.utcnow()
        )
        db.add(request_notification)

        new_ticket.request_manager_approval = True
    if user.employee_type == "Deputy Director":
        request_notification = AgentNotification(
            ticket_id=new_ticket.id,
            agent_id=assigned_agent.id,
            message=f"Ticket #{new_ticket.id} has had the request approval cycle completed. Please begin work on items",
            sent_at=datetime.utcnow()
        )
        db.add(request_notification)
        new_ticket.request_manager_approval = True
        new_ticket.request_deputy_approval = True
    db.commit()


# updating ticket fields
@router.put("/agent/update/{ticket_id}")
async def ticket_update(ticket_id: int, update_ticket: UpdateTicket, db: db_dependency,
                        agent: agent_dependency):
    update = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    # only updating if form data is present
    if update_ticket.agent_id is not None:
        update.agent_id = update_ticket.agent_id
    if update_ticket.ticket_type_id is not None:
        update.ticket_type_id = update_ticket.ticket_type_id
    if update_ticket.sla_id is not None:
        update.sla_id = update_ticket.sla_id
    if update_ticket.group_id is not None:
        update.group_id = update_ticket.group_id
    if update_ticket.title is not None:
        update.title = update_ticket.title
    if update_ticket.description is not None:
        update.description = update_ticket.description
    if update_ticket.category is not None:
        update.category = update_ticket.category
    if update_ticket.subcategory is not None:
        update.subcategory = update_ticket.subcategory
    if update_ticket.priority is not None:
        update.priority = update_ticket.priority
    if update_ticket.due_date is not None:
        update.due_date = update_ticket.due_date
    if update_ticket.ticket_status is not None:
        if update_ticket.ticket_status == "Closed":
            update.ticket_status == "Closed"
            update.completed_on = datetime.utcnow()
            log_status_change = Audits(
                ticket_id=ticket_id,
                action_by=agent["id"],
                new_status=update_ticket.ticket_status,
                updated_on=datetime.utcnow()
            )
            if (update.resolution_time + update.submitted_on) > datetime.utcnow():
                update.resolution_time_delinquency = False
            else:
                update.resolution_time_delinquency = True
        elif update_ticket.ticket_status == "Open" and update.ticket_status == "Closed":
            update.ticket_status == "Reopened"
            log_status_change = Audits(
                ticket_id=ticket_id,
                action_by=agent["id"],
                new_status="Reopened",
                updated_on=datetime.utcnow()
            )
            db.add(log_status_change)
    if update_ticket.priority is not None:
        update.priority = update_ticket.priority

    db.commit()
    db.refresh(update)
    return {"message": "Ticket was updated"}


