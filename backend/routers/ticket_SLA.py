# importing created tables
from database.tables import TicketSLA


# importing the session
from db_session import db_dependency, agent_dependency

# importing routing files
from schema.sla_schema import CreateSLA, UpdateSLA

# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter

# creating router
router = APIRouter(
    prefix='/ticket_slas',
    tags=['ticket_slas']
)

# Agent Only
# retrieving slas
@router.get('/')
async def get_slas(db: db_dependency, agent: agent_dependency):
    slas = db.query(TicketSLA).all()
    return slas


# viewing specific sla
@router.get('/{sla_id}')
async def get_sla(sla_id: int, db: db_dependency, agent: agent_dependency):
    sla = db.query(TicketSLA).filter(TicketSLA.id == sla_id).first()
    return sla


# sla creation router
@router.post("/sla_creation")
async def make_sla(create_sla: CreateSLA, db: db_dependency, agent: agent_dependency):
    new_sla = TicketSLA(
        sla_type=create_sla.sla_type,
        first_response_time=create_sla.first_response_time,
        resolution_time=create_sla.resolution_time

    )
    db.add(new_sla)
    db.commit()
    db.refresh(new_sla)
    return {"message": "Ticket SLA has been created."}


# updating slas
@router.put("/sla_update/{sla_id}")
async def sla_update(sla_id: int, update_sla: UpdateSLA, db: db_dependency, agent: agent_dependency):
    update = db.query(TicketSLA).filter(TicketSLA.id == sla_id).first()

    # only updating form data is present
    if update_sla.sla_type is not None:
        update.sla_type = update_sla.sla_type
    if update_sla.first_response_time is not None:
        update.first_response_time = update_sla.first_response_time
    if update_sla.resolution_time is not None:
        update.resolution_time = update_sla.resolution_time

    db.commit()
    db.refresh(update)
    return {"message": "Ticket SLA has been updated."}


# deleting sla
@router.delete("/sla_deletion/{sla_id}")
async def sla_deletion(sla_id: int, db: db_dependency, agent: agent_dependency):
    delete = db.query(TicketSLA).filter(TicketSLA.id == sla_id).first()
    db.delete(delete)
    db.commit()
    return {"message": "Ticket SLA has been deleted."}
