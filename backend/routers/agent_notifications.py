# importing created tables
from database.tables import Ticket, AgentNotification

# importing the db sessions
from db_session import db_dependency, agent_dependency


# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter, HTTPException

# creating router
router = APIRouter(
    prefix='/agent_notifications',
    tags=['agent_notifications']
)


# getting notifications
@router.get('/')
async def get_notifications(db: db_dependency, agent: agent_dependency):
    notifications = db.query(AgentNotification).filter(AgentNotification.agent_id == agent["id"],
                                                       AgentNotification.read == False).all()
    return notifications


# agent read notifications
@router.put('/{notification_id}')
async def read_notification(notification_id: int, db: db_dependency, agent: agent_dependency):
    notification = db.query(AgentNotification).filter(AgentNotification.id == notification_id).first()

    if notification.agent_id != agent["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to access.")
    notification.read = True
    db.commit()
    return {"message": "Notification has been acknowledged."}
