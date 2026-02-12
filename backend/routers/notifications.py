# importing created tables
from database.tables import Ticket, Notification

# importing the db sessions
from db_session import db_dependency, user_dependency


# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter, HTTPException

# creating router
router = APIRouter(
    prefix='/notifications',
    tags=['notifications']
)


# get all notifications
@router.get('/')
async def get_notifications(db: db_dependency, user: user_dependency):
    notifications = db.query(Notification).filter(Notification.user_id == user["id"],
                                                  Notification.read == False).all()
    return notifications


# user read notifications
@router.put('/{notification_id}')
async def read_notification(notification_id: int, db: db_dependency, user: user_dependency):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()

    if notification.user_id != user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to access.")
    notification.read = True
    db.commit()
    return {"message": "Notification has been acknowledged."}