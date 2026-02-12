# the code below was expirementaion and getting used to sqlalchemy

from sqlalchemy import insert, update, delete
from db_session import start_db
from tables import Users, Groups

db = next(start_db())

user_id = 5
supervisor_number = 1
division = 1
supervisor_id = 1

## creating manager entries automatically
# for x in range(0, 4):
#     program = 1
#     for y in range(0, 2):
#         manager_creation = {
#             'id': user_id,
#             'full_name': f'supervisor {supervisor_number}',
#             'email': f'supervisor{supervisor_number}@gmail.com',
#             'password': f'supervisor{supervisor_number}',
#             'division': f'D{division}',
#             'program': f'P{program}',
#             'employee_type': 'Management',
#             'supervisor_id': supervisor_id,
#             'created_by': 1
#         }
#         program += 1
#         supervisor_number += 1
#         user_id += 1
#         create_manager = insert(Users).values(manager_creation)
#         db.execute(create_manager)
#         db.commit()
#     division += 1
#     supervisor_id += 1

# creating manager entries automatically

user_id = 13
user_number = 1
supervisor_id = 5
division = 1

# realized I could simply tap into the x in for x...
# doing x + 1 just for fun
for x in range(0, 4):
    for y in range(0, 2):
        for z in range(2):
            user_creation = {
                'id': user_id,
                'full_name': f'user {user_number}',
                'email': f'user{user_number}@gmail.com',
                'password': f'userpass{user_number}',
                'division': f'D{x+1}',
                'program': f'P{y+1}',
                'employee_type': 'Line Staff',
                'supervisor_id': supervisor_id,
                'created_by': 1
            }

            create_user = insert(Users).values(user_creation)
            db.execute(create_user)
            db.commit()

            user_id += 1
            user_number += 1

        supervisor_id += 1  # Move to the next manager

# the code below is me just testing out sqlalchemy and getting used to its operations

# create_deputies_list = [
#     {
#         'id': 2,
#         'full_name': 'deputy director 2',
#         'email': 'deputydirector2@gmail.com',
#         'password': 'deputydirector2',
#         'division': 'D2',
#         'program': None,
#         'employee_type': 'Deputy Director',
#         'supervisor_id': 2,
#         'created_by': 1
#     },
#     {
#         'id': 3,
#         'full_name': 'deputy director 3',
#         'email': 'deputydirector3@gmail.com',
#         'password': 'deputydirector3',
#         'division': 'D3',
#         'program': None,
#         'employee_type': 'Deputy Director',
#         'supervisor_id': 3,
#         'created_by': 1
#     },
#     {
#         'id': 4,
#         'full_name': 'deputy director 4',
#         'email': 'deputydirector4@gmail.com',
#         'password': 'deputydirector4',
#         'division': 'D4',
#         'program': None,
#         'employee_type': 'Deputy Director',
#         'supervisor_id': 4,
#         'created_by': 1
#     }
# ]
# # manually testing out group creation
#
# group_creation1 = {
#     'id': 1,
#     'group_name': 'Information Systems'
# }
#
# group_creation = {
#     'id': 2,
#     'group_name': 'Communications'
# }
#
# query = insert(Users).values(user_test_entry)
# query2 = insert(Groups).values(group_creation)
# # update_user = update(Users).where(Users.id == 1).values(update_user)
# create_deputies = insert(Users).values(create_deputies_list)
#
# db.execute(create_deputies)
# db.commit()
