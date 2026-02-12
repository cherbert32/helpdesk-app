# importing created tables
from database.tables import TicketType


# importing the session
from db_session import db_dependency, agent_dependency

# importing routing files
from schema.ticket_type_schemas import CreateTicketType, UpdateTicketType

# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter


# creating router
router = APIRouter(
    prefix='/ticket_type',
    tags=['ticket_type']
)


# getting all ticket types
@router.get('/')
async def get_ticket_types(db: db_dependency, agent: agent_dependency):
    ticket_types = db.query(TicketType).all()
    return ticket_types


# retrieving ticket type row
@router.get('/{ticket_type_id}')
async def get_ticket_type(ticket_type_id: int, db: db_dependency, agent: agent_dependency):
    ticket_type = db.query(TicketType).filter(TicketType.id == ticket_type_id).first()
    return ticket_type


# creating ticket type
@router.post("/ticket_type_creation")
async def make_ticket_type(create_ticket_type: CreateTicketType, db: db_dependency,
                           agent: agent_dependency):
    new_ticket_type = TicketType(
        group_id=create_ticket_type.group_id,
        sla_id=create_ticket_type.sla_id,
        type_name=create_ticket_type.type_name,
        category=create_ticket_type.category,
        sub_category=create_ticket_type.sub_category,
        require_intake_form=create_ticket_type.require_intake_form
    )
    db.add(new_ticket_type)
    db.commit()
    db.refresh(new_ticket_type)
    return {"message": "Ticket Type has been created."}


# updating ticket type
@router.put("/ticket_type_update/{ticket_type_id}")
async def ticket_type_update(ticket_type_id: int, update_ticket_type: UpdateTicketType, db: db_dependency,
                     agent: agent_dependency):
    update = db.query(TicketType).filter(TicketType.id == ticket_type_id).first()

    # only updating if form data is present
    if update_ticket_type.group_id is not None:
        update.group_id = update_ticket_type.group_id
    if update_ticket_type.sla_id is not None:
        update.sla_id = update_ticket_type.sla_id
    if update_ticket_type.type_name is not None:
        update.type_name = update_ticket_type.type_name
    if update_ticket_type.category is not None:
        update.category = update_ticket_type.category
    if update_ticket_type.sub_category is not None:
        update.sub_category = update_ticket_type.sub_category
    if update_ticket_type.require_intake_form is not None:
        update.require_intake_form = update_ticket_type.require_intake_form

    db.commit()
    db.refresh(update)
    return {"message": "Ticket Type has been updated."}


# deleting ticket type
@router.delete("/ticket_type_deletion/{ticket_type_id}")
async def sla_deletion(ticket_type_id: int, db: db_dependency, agent: agent_dependency):
    delete = db.query(TicketType).filter(TicketType.id == ticket_type_id).first()
    db.delete(delete)
    db.commit()
    return {"message": "Ticket Type has been deleted."}