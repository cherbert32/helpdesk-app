# importing created tables
from database.tables import Feedback, Ticket

# importing the start_db function
from db_session import db_dependency, agent_dependency, user_dependency

# importing routing files
from schema.feedback_schema import CreateFeedback, EditFeedback

# grabbed these imports from the following link
# https://fastapi.tiangolo.com/advanced/templates/#install-dependencies
from fastapi import APIRouter, HTTPException

# creating router
router = APIRouter(
    prefix='/feedback',
    tags=['feedback']
)


# return all feedback
@router.get('/agent/all_feedback')
async def all_feedback(db: db_dependency, agent: agent_dependency):
    if agent["agent_type"] != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions.")

    feedback = db.query(Feedback).all()
    return feedback


# return feedback details
@router.get('/agent/{feedback_id}')
async def current_feedback(feedback_id: int, db: db_dependency, agent: agent_dependency):
    if agent["agent_type"] != "admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions.")

    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    return feedback


#  -------------------User Options Below-----------------  #

# return user related feedback
@router.get('/user/all_feedback/')
async def all_user_feedback(db: db_dependency, user: user_dependency):
    feedback = db.query(Feedback).filter(Feedback.created_by == user["id"]).all()
    return feedback


# viewed feedback; user view
@router.get('/user/{feedback_id}')
async def get_user_feedback(feedback_id: int, db: db_dependency, user: user_dependency):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if feedback.created_by != user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to access.")
    return feedback


# user feedback submission
@router.post("/user/create/{ticket_id}")
async def submit_feedback(ticket_id: int, new_feedback: CreateFeedback, db: db_dependency,
                          user: user_dependency):
    # checking if ticket exists
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")

    # new feedback object
    new_feedback = Feedback(
        ticket_id=ticket_id,
        agent_id=ticket.agent_id,
        rating=new_feedback.rating,
        comments=new_feedback.comments,
        created_by=user["id"]
    )
    # committing changes
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return {"message": "Feedback has been submitted."}


# updating feedback; user option
@router.put("/user/update/{feedback_id}")
async def update_feedback(feedback_id: int, edit_feedback: EditFeedback, db: db_dependency,
                          user: user_dependency):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    # only updating fields with data
    if feedback.created_by != user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to make changes.")
    if edit_feedback.rating is not None:
        feedback.rating = edit_feedback.rating
    if edit_feedback.comments is not None:
        feedback.comments = edit_feedback.comments

    # committing changes
    db.commit()
    db.refresh(feedback)
    return {"message": "Feedback has been updated"}


# feedback deletion; user option
@router.delete("/user/delete/{feedback_id}")
async def delete_feedback(feedback_id: int, db: db_dependency, user: user_dependency):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()

    if feedback.created_by != user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized to make changes.")
    db.delete(feedback)
    db.commit()
    return {"message": "Feedback has been deleted."}
