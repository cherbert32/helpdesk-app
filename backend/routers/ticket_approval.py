# importing required packages and classes
from database.tables import Ticket, TicketApprovals, Users, Agents, Notification, AgentNotification

from datetime import datetime
from typing import Optional

# importing the session
from db_session import db_dependency, agent_dependency, user_dependency
from sqlalchemy import or_
# importing routing files
from schema.approvals_schema import SubmitApproval, UpdateApproval, ResubmitApproval

# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter, HTTPException, Depends

# creating router
router = APIRouter(
    prefix='/approvals',
    tags=['approvals']
)


# get approvals: user option
@router.get('/user/')
async def get_approvals(db: db_dependency, user: user_dependency):
    approvals = db.query(TicketApprovals).filter(or_(TicketApprovals.recipient_id==user["id"], TicketApprovals.user_id == user["id"])).all()
    return approvals


# get specific approval: User
@router.get('/user/{approval_id}')
async def view_approval(approval_id: int, db: db_dependency, user: user_dependency):
    approval = db.query(TicketApprovals).filter(TicketApprovals.id == approval_id).first()
    if approval.recipient_id != user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to approval access.")
    return approval


# get approvals: user option
@router.get('/agent/')
async def get_approvals(db: db_dependency, agent: agent_dependency):
    current_agent = db.query(Agents).filter(Agents.id == agent["id"]).first()
    if current_agent.agent_type == "admin":
        approvals = db.query(TicketApprovals).all()
    else:
        approvals = db.query(TicketApprovals).filter(TicketApprovals.agent_id==agent["id"]).all()
    return approvals


# get specific approval: User
@router.get('/agent/{approval_id}')
async def view_approval(approval_id: int, db: db_dependency, agent: agent_dependency):
    approval = db.query(TicketApprovals).filter(TicketApprovals.id == approval_id).first()
    if approval.agent_id != agent["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to approval access.")
    return approval


# user interacting with pending approval
# since I combined both draft and request approval into on, both user and agent have to be optional as it will break
# if it isn't
@router.put('/decision/{approval_id}')
async def decision(approval_id: int, update_status: SubmitApproval, db: db_dependency,
                   user: user_dependency):
    # getting all required information
    approval = db.query(TicketApprovals).filter(TicketApprovals.id == approval_id).first()
    ticket = db.query(Ticket).filter(Ticket.id == approval.ticket_id).first()
    recipient = db.query(Users).filter(Users.id == approval.recipient_id).first()
    requestor = db.query(Users).filter(Users.id == approval.user_id).first()
    ticket_agent = db.query(Agents).filter(Agents.id == ticket.agent_id).first()

    # ensuring only the person that respond views the approval
    if approval.recipient_id != user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to approval access.")

    # updating approval with comments
    approval.status = update_status.status
    approval.comments = update_status.comments
    approval.submitted_on = datetime.utcnow()

    # feedback loop for rejected/approved notifications
    # draft approvals comments are only received by agent
    if update_status.status == "Rejected":
        if approval.approval_type == "request":
            rejection_notification = Notification(
                ticket_id=ticket.id,
                user_id=requestor.id,
                message=f"Approval rejected by {recipient.full_name} on ticket: {ticket.id}",
                sent_at=datetime.utcnow()
            )
        else:
            rejection_notification = AgentNotification(
                ticket_id=ticket.id,
                agent_id=ticket_agent.id,
                message=f"Approval rejected by {recipient.full_name} on ticket: {ticket.id}",
                sent_at=datetime.utcnow()
            )

        db.add(rejection_notification)
        db.commit()
        return {"message": "Approval rejection notification sent."}

    # approved feedback loop notifications
    if update_status.status == "Approved":
        # Send approval notification
        if approval.approval_type == "request":
            approval_notification = Notification(
                ticket_id=ticket.id,
                user_id=requestor.id,
                message=f"Approval accepted by {recipient.full_name} on ticket: {ticket.id}",
                sent_at=datetime.utcnow()
            )

        else:
            approval_notification = AgentNotification(
                ticket_id=ticket.id,
                agent_id=ticket_agent.id,
                message=f"Approval accepted by {recipient.full_name} on ticket: {ticket.id}",
                sent_at=datetime.utcnow()
            )
        db.add(approval_notification)
        db.commit()

    # starting next approval sequence
    # Request loop:
    # if the Line Staff submits ticket, then an approval is sent to their manager
        # after the above is approved then it sends the next approval to the deputy director
    # if the manager submits the ticket, then the approval is sent to the deputy director
    # if the deputy director submits the ticket, then all pending boolean values for request approval are approved

    # Draft loop:
    # for any draft related items, all parties identified are sent a pending approval
    # following suit, depending on who submits the ticket identifies the next person who receives it
    # Line Staff > Manager > Deputy Director: requires all 3 boolean values to signal ticket completion
    # Manager > Deputy Director: requires all 2 boolean values to signal ticket completion
    # Deputy Director: requires 1 boolean values to signal ticket completion
    employee_type = recipient.employee_type

    # after the next approval sequence begins, corresponding users are notified
    if approval.approval_type == "request":
        # pycharm returned a recommendation that next_role was being called without a variable existing
        # initialized an empty object to resolve warning issue
        next_role = None

        if employee_type == "Manager":
            next_role = "Deputy Director"
            new_approval = TicketApprovals(
                ticket_id=ticket.id,
                user_id=recipient.id,
                agent_id=ticket_agent.id,
                recipient_id=recipient.supervisor_id,
                role=next_role,
                status="Pending",
                created_on=datetime.utcnow(),
                approval_type="request"
            )
            db.add(new_approval)
            request_notification = Notification(
                ticket_id=ticket.id,
                user_id=recipient.supervisor_id,
                message=f"A request approval has been received for ticket #{ticket.id}.",
                sent_at=datetime.utcnow()
            )
            db.add(request_notification)
            ticket.request_manager_approval = True
            ticket.request_manager_approval_on = datetime.utcnow()
        elif employee_type == "Deputy Director":
            ticket.request_deputy_approval = True
            ticket.request_deputy_approval_on = datetime.utcnow()

    elif approval.approval_type == "draft":
        if employee_type == "Line Staff":
            # next_user would be the manager
            next_user = db.query(Users).filter(Users.id == recipient.supervisor_id).first()
            new_approval = TicketApprovals(
                ticket_id=ticket.id,
                user_id=next_user.id,
                agent_id=ticket_agent.id,
                recipient_id=next_user.supervisor_id,
                role=next_user.employee_type,
                status="Pending",
                created_on=datetime.utcnow(),
                approval_type="draft"
            )
            db.add(new_approval)
            request_notification = Notification(
                ticket_id=ticket.id,
                user_id=next_user.supervisor_id,
                message=f"A draft approval has been received for ticket #{ticket.id}.",
                sent_at=datetime.utcnow()
            )
            db.add(request_notification)
            ticket.draft_requestor_approval = True
            ticket.draft_requestor_approval_on = datetime.utcnow()

        elif employee_type == "Manager":
            # next_user would be the deputy director
            next_user = db.query(Users).filter(Users.id == recipient.supervisor_id).first()
            new_approval = TicketApprovals(
                ticket_id=ticket.id,
                user_id=next_user.id,
                agent_id=ticket_agent.id,
                recipient_id=next_user.supervisor_id,
                role=next_user.employee_type,
                status="Pending",
                created_on=datetime.utcnow(),
                approval_type="draft"
            )
            db.add(new_approval)
            request_notification = Notification(
                ticket_id=ticket.id,
                user_id=next_user.supervisor_id,
                message=f"A draft approval has been received for ticket #{ticket.id}."
            )
            db.add(request_notification)
            ticket.draft_manager_approval = True
            ticket.draft_manager_approval_on = datetime.utcnow()
        elif employee_type == "Deputy Director":
            ticket.draft_deputy_approval = True
            ticket.draft_deputy_approval_on = datetime.utcnow()

    db.commit()
    return {"message": "Approval accepted and next step processed."}


# resubmission router for rejected items
@router.post('/user/resubmit/{approval_id}')
async def resubmission(approval_id: int, resubmit: ResubmitApproval, db: db_dependency,
                       user: user_dependency):
    rejected_approval = db.query(TicketApprovals).filter(TicketApprovals.id == approval_id).first()

    ticket = db.query(Ticket).filter(Ticket.id == rejected_approval.ticket_id).first()


    # distinguishing the type of feedback request and sending appropriate notifications
    if user["id"] != rejected_approval.user_id:
        raise HTTPException(status_code=403, detail="Unauthorized to resubmit this approval.")
    rejected_approval.status = resubmit.status
    rejected_approval.comments = resubmit.comments
    rejected_approval.submitted_on = datetime.utcnow()
    resubmission_notification = Notification(
        ticket_id=ticket.id,
        user_id=rejected_approval.recipient_id,
        message=f"You have a pending resubmission request approval to review for ticket {ticket.id}",
        sent_at=datetime.utcnow()
    )
    db.add(resubmission_notification)
    db.commit()

    return{"message": "Approval resubmitted successfully."}


# resubmission router for rejected items
@router.post('/agent/resubmit/{approval_id}')
async def resubmission(approval_id: int, resubmit: ResubmitApproval, db: db_dependency,
                       agent: agent_dependency):
    rejected_approval = db.query(TicketApprovals).filter(TicketApprovals.id == approval_id).first()

    ticket = db.query(Ticket).filter(Ticket.id == rejected_approval.ticket_id).first()

    if agent["id"] != rejected_approval.agent_id:
        raise HTTPException(status_code=403, detail="Unauthorized to resubmit this approval.")
    rejected_approval.status = resubmit.status
    rejected_approval.comments = resubmit.comments
    rejected_approval.submitted_on = datetime.utcnow()
    resubmission_notification = Notification(
        ticket_id=ticket.id,
        user_id=rejected_approval.recipient_id,
        message=f"You have a pending resubmission draft approval to review for ticket {ticket.id}",
        sent_at=datetime.utcnow()
    )
    db.add(resubmission_notification)
    db.commit()
    return {"message": "Draft Approval resubmitted successfully."}



# starting the draft approval process: Agent only
@router.post('/start_draft_approval_process/{ticket_id}')
async def start_draft_approval_process(ticket_id: int, db: db_dependency, agent: agent_dependency):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket.agent_id != agent["id"] or agent["agent_type"] != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to start draft approval process.")

    # identifying who should receive the notification/approval
    user = db.query(Users).filter(Users.id == ticket.user_id).first()
    ticket.feedback_status = "draft"
    start_approval = TicketApprovals(
        ticket_id=ticket.id,
        user_id=user.id,
        agent_id=agent["id"],
        recipient_id=user.id,
        created_on=datetime.utcnow(),
        role=user.employee_type,
        status="Pending",
        approval_type='draft'
    )
    db.add(start_approval)

    notify_user = Notification(
        ticket_id=ticket.id,
        user_id=user.id,
        message=f"Pending draft approval request for ticket #{ticket.id}",
        sent_at=datetime.utcnow()
    )
    db.add(notify_user)
    db.commit()
    return {"message": "Draft approval process started."}


# reassigning approval: Agent only
# there are some cases where the person who needs to approve won't be available. This will allow us to reassign it.
@router.put('/reassign/{approval_id}')
async def reassignment(approval_id: int, reassign: UpdateApproval,  db: db_dependency,
                       agent: agent_dependency):
    approval = db.query(TicketApprovals).filter(TicketApprovals.id == approval_id).first()
    if approval.agent_id != agent["id"] or agent["agent_type"] != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to reassign approval.")
    approval.recipient_id = reassign.recipient_id
    db.commit()
    db.refresh(approval)
    return {"message": "Approval reassigned successfully", "new_recipient_id": approval.recipient_id}






