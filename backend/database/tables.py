# importing all required functions to create tables
from sqlalchemy import (
    Column, Integer, Text, Boolean, DateTime, ForeignKey, Interval
)
from sqlalchemy.ext.declarative import declarative_base

from datetime import datetime

# creating Base as a python object
Base = declarative_base()


# the following classes reflect fields required during the first initial stage of this project to create Tables
# --------------------------------------------------#

class Ticket(Base):
    __tablename__ = 'tickets'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'))
    ticket_type_id = Column(Integer, ForeignKey('ticket_types.id'))
    sla_id = Column(Integer, ForeignKey('ticket_sla.id'))
    group_id = Column(Integer, ForeignKey('groups.id'))
    title = Column(Text, nullable=False)
    description = Column(Text)
    category = Column(Text)
    subcategory = Column(Text)
    ticket_status = Column(Text)
    priority = Column(Text)
    division = Column(Text)
    program = Column(Text)
    due_date = Column(DateTime)
    submitted_on = Column(DateTime, default=datetime.utcnow)
    first_response_time = Column(DateTime)
    first_response_time_delinquency = Column(Boolean, default=False)
    resolution_time = Column(DateTime)
    resolution_time_delinquency = Column(Boolean, default=False)
    completed_on = Column(DateTime)
    feedback_status = Column(Text)
    request_manager_approval = Column(Boolean, default=False)
    request_manager_approval_on = Column(DateTime)
    request_deputy_approval = Column(Boolean, default=False)
    request_deputy_approval_on = Column(DateTime)
    draft_requestor_approval = Column(Boolean, default=False)
    draft_requestor_approval_on = Column(DateTime)
    draft_manager_approval = Column(Boolean, default=False)
    draft_manager_approval_on = Column(DateTime)
    draft_deputy_approval = Column(Boolean, default=False)
    draft_deputy_approval_on = Column(DateTime)


# --------------------------------------------------#

class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(Text)
    email = Column(Text, unique=True)
    password = Column(Text)
    division = Column(Text)
    program = Column(Text)
    active = Column(Boolean)
    employee_type = Column(Text)
    supervisor_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('agents.id'))
    updated_by = Column(Integer, ForeignKey('agents.id'))
    updated_at = Column(DateTime, default=datetime.utcnow)


# --------------------------------------------------#

class Agents(Base):
    __tablename__ = 'agents'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(Text)
    email = Column(Text, unique=True)
    password = Column(Text)
    agent_type = Column(Text)
    group_id = Column(Integer, ForeignKey('groups.id'))
    active = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('agents.id'))
    updated_by = Column(Integer, ForeignKey('agents.id'))
    updated_at = Column(DateTime)


# --------------------------------------------------#

class Groups(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    group_name = Column(Text)


# --------------------------------------------------#

class TicketType(Base):
    __tablename__ = 'ticket_types'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    group_id = Column(Integer, ForeignKey('groups.id'))
    sla_id = Column(Integer, ForeignKey('ticket_sla.id'))
    type_name = Column(Text)
    category = Column(Text)
    sub_category = Column(Text)
    require_intake_form = Column(Boolean)


# --------------------------------------------------#

class TicketSLA(Base):
    __tablename__ = 'ticket_sla'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sla_type = Column(Text)
    first_response_time = Column(Interval)
    resolution_time = Column(Interval)


# --------------------------------------------------#

class Feedback(Base):
    __tablename__ = 'feedback'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(Integer, ForeignKey('tickets.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'))
    rating = Column(Integer)
    comments = Column(Text)
    created_by = Column(Integer, ForeignKey('users.id'))


# --------------------------------------------------#

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(Integer, ForeignKey('tickets.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    message = Column(Text)
    read = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=datetime.utcnow)


# --------------------------------------------------#

class AgentNotification(Base):
    __tablename__ = 'agent_notifications'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(Integer, ForeignKey('tickets.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'))
    message = Column(Text)
    read = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=datetime.utcnow)


# --------------------------------------------------#

class Audits(Base):
    __tablename__ = 'audits'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(Integer, ForeignKey('tickets.id'))
    action_by = Column(Integer)
    new_status = Column(Text)
    updated_on = Column(DateTime, default=datetime.utcnow)


# --------------------------------------------------#

class TicketApprovals(Base):
    __tablename__ = 'ticket_approvals'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(Integer, ForeignKey('tickets.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'))
    recipient_id = Column(Integer, ForeignKey('users.id'))
    created_on = Column(DateTime, default=datetime.utcnow)
    submitted_on = Column(DateTime, nullable=True)
    role = Column(Text, nullable=True)
    status = Column(Text, nullable=True)
    approval_type = Column(Text, nullable=True)
    comments = Column(Text, nullable=True)


# --------------------------------------------------#


class TicketHistory(Base):
    __tablename__ = 'ticket_history'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id = Column(Integer, ForeignKey('tickets.id'))
    message = Column(Text)
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'))


