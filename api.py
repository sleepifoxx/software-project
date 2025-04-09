from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from database import get_db
from models.users import Users
from models.posts import Posts
from models.favourites import Favourites
from models.postComments import PostComments
from models.postImages import PostImages
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc thay "*" bằng URL frontend cụ thể nếu cần bảo mật
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/check_login",tags=["User"])
async def check_login(username: str, password: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Users).where(Users.username == username, Users.password == password))
    user = result.scalars().first()
    if user:
        return {"status": "success", "user": user}
    else:
        return {"status": "fail", "message": "Invalid username or password"}


@app.post("/check_signup",tags=["User"])
async def create_user(username: str, password: str, db: AsyncSession = Depends(get_db)):
    existing_user = await db.execute(select(Users).where(Users.username == username))
    if existing_user.scalars().first():
        return {"status": "fail", "message": "Username already exists"}

    new_user = Users(username=username, password=password)
    db.add(new_user)
    await db.commit()
    return {"status": "success", "message": "User created successfully"}


@app.get("/get_info",tags=["User"])
async def get_user_info(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Users).where(Users.id == user_id))
    user = result.scalars().first()
    if user:
        return {"status": "success", "user": user}
    else:
        return {"status": "fail", "message": "User not found"}


@app.get("/get-post",tags=["Posts"])
async def get_posts_by_limit(limit: int, db: AsyncSession = Depends(get_db)):
    if limit <= 0:
        return {"status": "fail", "message": "Limit must be greater than 0"}
    result = await(db.execute(select(Posts).order_by(desc(Posts.id)).limit(limit)))
    posts = result.scalars().all()
    return {"status": "success", "posts": posts}


@app.get("/post-images",tags=["Posts"])
async def get_post_images(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PostImages).where(PostImages.post_id == post_id))
    images_id = result.scalars().all()
    if images_id:
        return {"status": "success", "images": images_id}
    else:
        return {"status": "fail", "message": "Post not found or no images available"}
    

@app.get("/post-comments",tags=["Posts"])
async def get_post_comments(post_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PostComments).where(PostComments.post_id == post_id))
    comments = result.scalars().all()
    if comments:
        return {"status": "success", "comments": comments}
    else:
        return {"status": "fail", "message": "Post not found or no comments available"}
    
    
@app.get("/favourites",tags=["Favourites"])
async def get_favourites(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Favourites).where(Favourites.user_id == user_id))
    favourites = result.scalars().all()
    if favourites:
        return {"status": "success", "favourites": favourites}
    else:
        return {"status": "fail", "message": "No favourites found"}

@app.post("/add-favourite",tags=["Favourites"])
async def add_favourite(user_id: int, post_id: int, db: AsyncSession = Depends(get_db)):
    new_favourite = Favourites(user_id=user_id, post_id=post_id)
    db.add(new_favourite)
    await db.commit()
    return {"status": "success", "message": "Favourite added successfully"}

@app.delete("/remove-favourite",tags=["Favourites"])
async def remove_favourite(user_id: int, post_id: int, db: AsyncSession = Depends(get_db)):
    favourite = await db.execute(select(Favourites).where(Favourites.user_id == user_id, Favourites.post_id == post_id))
    favourite_to_delete = favourite.scalars().first()
    if favourite_to_delete:
        await db.delete(favourite_to_delete)
        await db.commit()
        return {"status": "success", "message": "Favourite removed successfully"}
    else:
        return {"status": "fail", "message": "Favourite not found"}
    
@app.post("/add-comment",tags=["Posts"])
async def add_comment(post_id: int, user_id: int, comment: str, db: AsyncSession = Depends(get_db)):
    new_comment = PostComments(post_id=post_id, user_id=user_id, comment=comment)
    db.add(new_comment)
    await db.commit()
    return {"status": "success", "message": "Comment added successfully"}

@app.delete("/delete-comment",tags=["Posts"])
async def delete_comment(comment_id: int, db: AsyncSession = Depends(get_db)):
    comment = await db.execute(select(PostComments).where(PostComments.id == comment_id))
    comment_to_delete = comment.scalars().first()
    if comment_to_delete:
        await db.delete(comment_to_delete)
        await db.commit()
        return {"status": "success", "message": "Comment deleted successfully"}
    else:
        return {"status": "fail", "message": "Comment not found"}
    
@app.post("/add-post",tags=["Posts"])
async def add_post(user_id: int, title: str, content: str, db: AsyncSession = Depends(get_db)):
    new_post = Posts(user_id=user_id, title=title, content=content)
    db.add(new_post)
    await db.commit()
    return {"status": "success", "message": "Post added successfully"}

@app.delete("/delete-post",tags=["Posts"])
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    post = await db.execute(select(Posts).where(Posts.id == post_id))
    post_to_delete = post.scalars().first()
    if post_to_delete:
        await db.delete(post_to_delete)
        await db.commit()
        return {"status": "success", "message": "Post deleted successfully"}
    else:
        return {"status": "fail", "message": "Post not found"}

