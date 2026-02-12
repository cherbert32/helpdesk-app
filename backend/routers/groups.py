# importing created tables
from database.tables import Groups

# importing dependencies
from db_session import db_dependency, agent_dependency

# importing routing files
from schema.group_schemas import CreateGroup, UpdateGroup

# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter

# creating router
router = APIRouter(
    prefix='/groups',
    tags=['groups']
)


# -------- Agent only routes -----------
# get all groups
@router.get('/')
async def get_groups(db: db_dependency, agent: agent_dependency):
    groups = db.query(Groups).all()
    return groups


# get specific group
@router.get('/{group_id}')
async def get_group(group_id: int, db: db_dependency, agent: agent_dependency):
    group = db.query(Groups).filter(Groups.id == group_id).first()
    return group


# group creation
@router.post("/group_creation")
async def make_group(create_group: CreateGroup, db: db_dependency, agent: agent_dependency):
    new_group = Groups(
        group_name=create_group.group_name
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return {"message": "Group has been created."}


# group update
@router.put("/group_update/{group_id}")
async def group_update(group_id: int, update_group: UpdateGroup, db: db_dependency,
                       agent: agent_dependency):
    update = db.query(Groups).filter(Groups.id == group_id).first()
    update.group_name = update_group.group_name
    db.commit()
    db.refresh(update)
    return {"message": "Group has been updated."}


# group deletion
@router.delete("/group_deletion/{group_id}")
async def delete_group(group_id: int, db: db_dependency,
                     agent: agent_dependency):
    delete = db.query(Groups).filter(Groups.id == group_id).first()
    db.delete(delete)
    db.commit()
    return {"message": "Group has been deleted."}