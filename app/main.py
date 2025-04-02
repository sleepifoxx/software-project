from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.users import Users
from models.posts import Posts
from models.favourites import Favourites
from models.postComments import PostComments
from models.postImages import PostImages

app = FastAPI()

# Route lấy tất cả người dùng


@app.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Users))  # Truy vấn tất cả người dùng
    users = result.scalars().all()  # Lấy tất cả người dùng từ kết quả
    return users


@app.get("/login")
async def check_login(username: str, password: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Users).where(Users.username == username, Users.password == password))
    user = result.scalars().first()
    if user:
        return {"status": "success", "user": user}
    else:
        return {"status": "fail", "message": "Invalid username or password"}


@app.post("/signup")
async def create_user(username: str, password: str, db: AsyncSession = Depends(get_db)):
    # Kiểm tra xem người dùng đã tồn tại chưa
    existing_user = await db.execute(select(Users).where(Users.username == username))
    if existing_user.scalars().first():
        return {"status": "fail", "message": "Username already exists"}

    # Tạo người dùng mới
    new_user = Users(username=username, password=password)
    db.add(new_user)
    await db.commit()
    return {"status": "success", "message": "User created successfully"}


@app.get("/info/{user_id}")
async def get_user_info(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Users).where(Users.id == user_id))
    user = result.scalars().first()
    if user:
        return {"status": "success", "user": user}
    else:
        return {"status": "fail", "message": "User not found"}
