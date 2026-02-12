# importing required packages and classes
from database.tables import (Ticket, TicketApprovals, Users, Agents,
                             Notification, AgentNotification, Groups, TicketSLA, TicketType, Audits, Feedback)

from datetime import datetime
from typing import Optional
from sqlalchemy import func, case
# importing the session
from db_session import db_dependency, agent_dependency, user_dependency

import pandas as pd
from openpyxl import Workbook

# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from io import BytesIO

# creating router
router = APIRouter(
    prefix='/analytics',
    tags=['analytics']
)


# average satisfaction rating
@router.get('/average_satisfaction/{agent_id}')
async def agent_feedback(agent_id: int, db: db_dependency, agent: agent_dependency):
    # scalar returns only the value
    feedback = db.query(func.avg(Feedback.rating)).filter(Feedback.agent_id == agent["id"]).scalar()
    return feedback


# average satisfaction rating
@router.get('/average_satisfaction')
async def agent_feedback(db: db_dependency, agent: agent_dependency):
    # scalar returns only the value
    feedback = db.query(func.avg(Feedback.rating)).scalar()
    return feedback


# number of delinquent tickets where first response time was not met
@router.get('/total_first_response_delinquency')
async def total_first_response_delinquency(db: db_dependency, agent: agent_dependency):
    # Joining Ticket and Users where the user ids are equal
    # selecting all tickets per employee and sorting them
    total_tickets = db.query(func.count(Ticket.id))\
        .filter(Ticket.first_response_time_delinquency == True).scalar()
    return total_tickets


# number of delinquent tickets where first response time was not met by groups
@router.get('/total_first_response_delinquency_by_group')
async def total_first_response_delinquency_by_group(db: db_dependency, agent: agent_dependency):
    tickets = (
        db.query(Ticket.group_id, func.count(Ticket.id))\
            .filter(Ticket.first_response_time_delinquency == True)\
            .group_by(Ticket.group_id).all()
    )

    results = []
    for group_name, count in tickets:
        results.append({
            "group_name": group_name,
            "delinquent_ticket_count": count
        })

    return results


# number of delinquent tickets where first response time was not met by category
@router.get('/total_first_response_delinquency_by_category')
async def total_first_response_delinquency_by_category(db: db_dependency, agent: agent_dependency):
    tickets = (
        db.query(Ticket.category, func.count(Ticket.id))\
            .filter(Ticket.first_response_time_delinquency == True)\
            .group_by(Ticket.category).all()
    )

    results = []
    for category, count in tickets:
        results.append({
            "category": category,
            "delinquent_ticket_count": count
        })

    return results


# number of tickets reopened
@router.get('/reopened_tickets')
async def reopened_tickets(db: db_dependency, agent: agent_dependency):
    # Joining Ticket and Users where the user ids are equal
    # selecting all tickets per employee and sorting them
    reopened = db.query(func.count(Audits.id)).filter(Audits.new_status == "Reopened").scalar()
    return reopened


# number of tickets submitted by employee type
@router.get('/total_tickets_by_employee_type')
async def total_tickets_employee_type(db: db_dependency, agent: agent_dependency):
    tickets = (
        db.query(Users.employee_type, func.count(Ticket.id))\
            .join(Ticket, Ticket.user_id == Users.id).group_by(Users.employee_type).all()
    )

    results = []
    for employee_type, count in tickets:
        results.append({
            "employee_type": employee_type,
            "ticket_count": count
        })

    return results


# number of tickets by user
@router.get('/total_tickets_by_user')
async def total_tickets_user(db: db_dependency, agent: agent_dependency):
    tickets = (
        db.query(Users.full_name, func.count(Ticket.id))\
            .join(Ticket, Ticket.user_id == Users.id).group_by(Users.full_name).all()
    )

    results = []
    for full_name, count in tickets:
        results.append({
            "full_name": full_name,
            "ticket_count": count
        })

    return results


# number of tickets by category
@router.get('/total_tickets_by_category')
async def total_tickets_category(db: db_dependency, agent: agent_dependency):
    tickets = (
        db.query(TicketType.category, func.count(Ticket.id))\
            .join(Ticket, Ticket.ticket_type_id == TicketType.id).group_by(TicketType.category).all()
    )

    results = []
    for category, count in tickets:
        results.append({
            "category": category,
            "ticket_count": count
        })

    return results


# number of tickets resolved by agent
@router.get('/total_tickets_resolved_by_agents')
async def total_tickets_resolved_by_agent(db: db_dependency, agent: agent_dependency):
    tickets = (
        db.query(Agents.full_name, func.count(Ticket.id)).join(Ticket, Ticket.agent_id == Agents.id)\
            .filter(Ticket.ticket_status == "Closed").group_by(Agents.full_name).all()
    )

    results = []
    for agent_name, count in tickets:
        results.append({
            "agent_name": agent_name,
            "resolved_ticket_count": count
        })

    return results


# number of tickets resolved by groups
@router.get('/total_tickets_resolved_by_groups')
async def total_tickets_resolved_by_groups(db: db_dependency, agent: agent_dependency):
    tickets = (
        db.query(Groups.group_name, func.count(Ticket.id))\
            .join(Ticket, Ticket.group_id == Groups.id).filter(Ticket.ticket_status == "Closed")\
            .group_by(Groups.group_name).all()
    )

    results = []
    for group_name, count in tickets:
        results.append({
            "group_name": group_name,
            "resolved_ticket_count": count
        })

    return results


# User routers below
@router.get("/tickets_by_status")
async def get_ticket_status(db: db_dependency, user: user_dependency):
    current = db.query(Users).filter(Users.id== user["id"]).first()

    if current.employee_type == "Line Staff":
        tickets = db.query(Ticket.ticket_status, func.count(Ticket.id))\
            .filter(Ticket.user_id == current.id).group_by(Ticket.ticket_status).all()
    elif current.employee_type == "Manager":
        tickets = db.query(Ticket.ticket_status, func.count(Ticket.id)) \
            .filter(Ticket.program == current.program).group_by(Ticket.ticket_status).all()
    elif current.employee_type == "Deputy Director":
        tickets = db.query(Ticket.ticket_status, func.count(Ticket.id)) \
            .filter(Ticket.division == current.division).group_by(Ticket.ticket_status).all()
    results = []
    for ticket_status, count in tickets:
        result = {
            "ticket_status": ticket_status,
            "count": count
        }
        results.append(result)

    return results


@router.get("/tickets_by_employee_type")
async def get_tickets_by_employee_type(db: db_dependency, user: user_dependency):
    current = db.query(Users).filter(Users.id== user["id"]).first()

    if current.employee_type == "Line Staff":
        tickets = db.query(Users.employee_type, func.count(Ticket.id))\
            .join(Ticket, Ticket.user_id==Users.id).filter(Ticket.user_id == current.id)\
            .group_by(Users.employee_type).all()
    elif current.employee_type == "Manager":
        tickets = db.query(Users.employee_type, func.count(Ticket.id)) \
            .join(Ticket, Ticket.user_id == Users.id).filter(Ticket.program == current.program) \
            .group_by(Users.employee_type).all()
    elif current.employee_type == "Deputy Director":
        tickets = db.query(Users.employee_type, func.count(Ticket.id)) \
            .join(Ticket, Ticket.user_id == Users.id).filter(Ticket.division == current.division) \
            .group_by(Users.employee_type).all()

    results = []
    for employee_type, count in tickets:
        result = {
            "employee_type": employee_type,
            "count": count
        }
        results.append(result)

    return results



# creates an excel of all tickets based on employee type
# Line staff return a report of their tickets
# Managers return a report of their tickets and the people they supervise
# Deputy Directors return a report of their tickets and all the people they oversee
@router.get('/report')
async def ticket_report(db: db_dependency, user: user_dependency):
    tickets = None
    employee = db.query(Users).filter(Users.id == user["id"]).first()
    if employee.employee_type == "Line Staff":
        tickets = db.query(Ticket).filter(Ticket.user_id == employee.id).all()
    elif employee.employee_type == "Manager":
        tickets = db.query(Ticket).filter(Ticket.program == employee.program).all()
    elif employee.employee_type == "Deputy Director":
        tickets = db.query(Ticket).filter(Ticket.division == employee.division).all()

    report = []

    for x in tickets:
        add = {
            "id": x.id,
            "user_id": x.user_id,
            "agent_id": x.agent_id,
            "ticket_type_id": x.ticket_type_id,
            "sla_id": x.sla_id,
            "group_id": x.group_id,
            "title": x.title,
            "description": x.description,
            "category": x.category,
            "subcategory": x.subcategory,
            "ticket_status": x.ticket_status,
            "priority": x.priority,
            "division": x.division,
            "program": x.program,
            "due_date": x.due_date,
            "submitted_on": x.submitted_on,
            "first_response_time": x.first_response_time,
            "first_response_time_delinquency": x.first_response_time_delinquency,
            "resolution_time": x.resolution_time,
            "resolution_time_delinquency": x.resolution_time_delinquency,
            "feedback_status": x.feedback_status,
            "request_manager_approval": x.request_manager_approval,
            "request_manager_approval_on": x.request_manager_approval_on,
            "request_deputy_approval": x.request_deputy_approval,
            "request_deputy_approval_on": x.request_deputy_approval_on,
            "draft_requestor_approval": x.draft_requestor_approval,
            "draft_requestor_approval_on": x.draft_requestor_approval_on,
            "draft_manager_approval": x.draft_manager_approval,
            "draft_manager_approval_on": x.draft_manager_approval_on,
            "draft_deputy_approval": x.draft_deputy_approval,
            "draft_deputy_approval_on": x.draft_deputy_approval_on
        }
        report.append(add)

    df = pd.DataFrame(report)
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False)
    return StreamingResponse(
        BytesIO(buffer.getvalue()),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={"Content-Disposition": f"attachment; filename=data.csv"}
    )