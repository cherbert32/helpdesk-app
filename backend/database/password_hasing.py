# the code below is after realising I made users without first hashing the passwords


from sqlalchemy import insert, update, delete
from db_session import start_db, bcrypt_context
from tables import Users, Agents

db = next(start_db())

users = db.query(Users).all()
agents = db.query(Agents).first()

for x in users:
    password = x.password
    if not password.startswith('$2'):
        new_password = bcrypt_context.hash(password)
        db.execute(update(Users).where(Users.id == x.id).values(password=new_password))
        db.commit()


password = agents.password
if not password.startswith('$2'):
    new_password = bcrypt_context.hash(password)
    db.execute(update(Agents).where(Agents.id == agents.id).values(password=new_password))
    db.commit()
