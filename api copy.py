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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/login",tags=["Tài khoản"])
async def login(email: str, password: str, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào email và password để đăng nhập. 
    Trả về thông tin người dùng nếu đăng nhập thành công hoặc thông báo lỗi nếu không thành công.
    """
    result = await db.execute(select(Users).where(Users.email == email, Users.password == password))
    user = result.scalars().first()
    if user:
        return {"status": "success", "user": user}
    else:
        return {"status": "fail", "message": "Invalid username or password"}


@app.post("/signup",tags=["Tài khoản"])
async def signup(email: str, password: str, contact_number:str, full_name: str, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào email, password, contact_number và full_name  để đăng ký tài khoản mới.
    Nếu email đã tồn tại, trả về thông báo lỗi.
    Nếu không, tạo tài khoản mới và lưu vào cơ sở dữ liệu.
    """
    existing_user = await db.execute(select(Users).where(Users.email == email))
    if existing_user.scalars().first():
        return {"status": "fail", "message": "Email already exists"}

    new_user = Users(email=email, password=password, contact_number=contact_number, full_name=full_name)
    db.add(new_user)
    await db.commit()
    return {"status": "success", "message": "User created successfully"}

@app.put("/update-user",tags=["Tài khoản"])
async def update_user(user_id: int, email:str, password:str, contact_number:str, full_name:str, avatar_url:str=None, address:str=None, gender: str=None, birthday:str=None, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào user_id và các thông tin cần cập nhật để cập nhật thông tin người dùng.
    Nếu tìm thấy người dùng, cập nhật thông tin của người dùng đó.
    Nếu không tìm thấy, trả về thông báo lỗi. 
    """
    user = await db.execute(select(Users).where(Users.id == user_id))
    user_to_update = user.scalars().first()
    if user_to_update:
        user_to_update.email = email
        user_to_update.password = password
        user_to_update.avatar_url = avatar_url
        user_to_update.contact_number = contact_number
        user_to_update.address = address
        user_to_update.gender = gender
        user_to_update.birthday = birthday
        user_to_update.full_name = full_name
        await db.commit()
        return {"status": "success", "message": "User updated successfully"}
    else:
        return {"status": "fail", "message": "User not found"}
    

@app.get("/get-user-info",tags=["Tài khoản"])
async def get_user_info(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào user_id để lấy thông tin người dùng.
    Nếu tìm thấy người dùng, trả về thông tin của người dùng đó.
    Nếu không tìm thấy, trả về thông báo lỗi.
    """
    if user_id <= 0:
        return {"status": "fail", "message": "Invalid user ID"}
    result = await db.execute(select(Users).where(Users.id == user_id))
    user = result.scalars().first()
    if user:
        return {"status": "success", "user": user}
    else:
        return {"status": "fail", "message": "User not found"}


@app.get("/get-list-of-posts",tags=["Bài đăng"])
async def get_list_of_posts(limit: int, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào một số limit để lấy danh sách bài viết theo giới hạn.
    Nếu limit <= 0, trả về thông báo lỗi.
    Nếu tìm thấy bài viết, trả về số các bài viết đó.
    Nếu không tìm thấy, trả về thông báo lỗi.
    """
    if limit <= 0:
        return {"status": "fail", "message": "Limit must be greater than 0"}
    result = await(db.execute(select(Posts).order_by(desc(Posts.id)).limit(limit)))
    posts = result.scalars().all()
    return {"status": "success", "posts": posts}

@app.get("/get-posts-by-user",tags=["Bài đăng"])
async def get_posts_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào user_id để lấy danh sách bài viết của người dùng.
    Nếu tìm thấy bài viết, trả về danh sách bài viết đó.
    Nếu không tìm thấy, trả về thông báo lỗi.
    """
    result = await db.execute(select(Posts).where(Posts.user_id == user_id))
    posts = result.scalars().all()
    if posts:
        return {"status": "success", "posts": posts}
    else:
        return {"status": "fail", "message": "No posts found for this user"}
    
@app.get("/get-post-by-id",tags=["Bài đăng"])
async def get_post_by_id(post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào post_id để lấy thông tin bài viết.
    Nếu tìm thấy bài viết, trả về thông tin của bài viết đó.
    Nếu không tìm thấy, trả về thông báo lỗi.
    """
    result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = result.scalars().first()
    if post:
        return {"status": "success", "post": post}
    else:
        return {"status": "fail", "message": "Post not found"}

@app.post("publish-post",tags=["Bài đăng"])
async def publish_post(user_id:int, title: str, description: str, price:int, type: str, deposit:int, , db: AsyncSession = Depends(get_db)):
    """
    Truyền  
    """


@app.get("/post-images",tags=["Bài đăng"])
async def get_post_images(post_id: int, db: AsyncSession = Depends(get_db)):
    """ 
    Truyền vào post_id để lấy danh sách url hình ảnh của bài viết.
    Nếu tìm thấy hình ảnh, trả về danh sách url hình ảnh đó.
    Nếu không tìm thấy, trả về thông báo lỗi.
    """
    result = await db.execute(select(PostImages).where(PostImages.post_id == post_id))
    images_id = result.scalars().all()
    if images_id:
        return {"status": "success", "images": images_id}
    else:
        return {"status": "fail", "message": "Post not found or no images available"}
    

@app.get("/post-comments",tags=["Bài đăng"])
async def get_post_comments(post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào post_id để lấy danh sách đánhn giá của bài viết.
    Nếu tìm thấy bình luận, trả về danh sách đánh giá đó.
    Nếu không tìm thấy, trả về thông báo lỗi.
    """
    
    result = await db.execute(select(PostComments).where(PostComments.post_id == post_id))
    comments = result.scalars().all()
    if comments:
        return {"status": "success", "comments": comments}
    else:
        return {"status": "fail", "message": "Post not found or no comments available"}
    
    
@app.get("/favourites",tags=["Yêu thích"])
async def get_favourites(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào user_id để lấy danh sách bài viết yêu thích của người dùng.
    Nếu tìm thấy bài viết yêu thích, trả về danh sách bài viết đó.
    Nếu không tìm thấy, trả về thông báo lỗi.
    """
    
    result = await db.execute(select(Favourites).where(Favourites.user_id == user_id))
    favourites = result.scalars().all()
    if favourites:
        return {"status": "success", "favourites": favourites}
    else:
        return {"status": "fail", "message": "No favourites found"}

@app.post("/add-favourite",tags=["Yêu thích"])
async def add_favourite(user_id: int, post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào user_id và post_id để thêm bài viết vào danh sách yêu thích.
    Nếu bài viết đã tồn tại trong danh sách yêu thích, trả về thông báo lỗi.
    Nếu không, thêm bài viết vào danh sách yêu thích.
    """
    
    existing_favourite = await db.execute(select(Favourites).where(Favourites.user_id == user_id, Favourites.post_id == post_id))
    if existing_favourite.scalars().first():
        return {"status": "fail", "message": "Favourite already exists"}
    
    new_favourite = Favourites(user_id=user_id, post_id=post_id)
    db.add(new_favourite)
    await db.commit()
    return {"status": "success", "message": "Favourite added successfully"}

@app.delete("/remove-favourite",tags=["Yêu thích"])
async def remove_favourite(user_id: int, post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào user_id và post_id để xóa bài viết khỏi danh sách yêu thích.
    Nếu tìm thấy bài viết trong danh sách yêu thích, xóa bài viết đó.
    Nếu không tìm thấy, trả về thông báo lỗi.
    """
    
    favourite = await db.execute(select(Favourites).where(Favourites.user_id == user_id, Favourites.post_id == post_id))
    favourite_to_delete = favourite.scalars().first()
    if favourite_to_delete:
        await db.delete(favourite_to_delete)
        await db.commit()
        return {"status": "success", "message": "Favourite removed successfully"}
    else:
        return {"status": "fail", "message": "Favourite not found"}
    
@app.post("/add-comment",tags=["Bài đăng"])
async def add_comment(post_id: int, user_id: int, comment: str, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào post_id, user_id và comment để thêm bình luận vào bài viết.
    Nếu bài viết không tồn tại, trả về thông báo lỗi.
    Nếu không, thêm bình luận vào bài viết.
    """
    post = await db.execute(select(Posts).where(Posts.id == post_id))
    if not post.scalars().first():
        return {"status": "fail", "message": "Post not found"}
    existing_comment = await db.execute(select(PostComments).where(PostComments.post_id == post_id, PostComments.user_id == user_id, PostComments.comment == comment))
    if existing_comment.scalars().first():
        return {"status": "fail", "message": "Comment already exists"}
    
    new_comment = PostComments(post_id=post_id, user_id=user_id, comment=comment)
    db.add(new_comment)
    await db.commit()
    return {"status": "success", "message": "Comment added successfully"}

@app.delete("/delete-comment",tags=["Bài đăng"])
async def delete_comment(comment_id: int, db: AsyncSession = Depends(get_db)):
    comment = await db.execute(select(PostComments).where(PostComments.id == comment_id))
    comment_to_delete = comment.scalars().first()
    if comment_to_delete:
        await db.delete(comment_to_delete)
        await db.commit()
        return {"status": "success", "message": "Comment deleted successfully"}
    else:
        return {"status": "fail", "message": "Comment not found"}
    
@app.post("/add-post",tags=["Bài đăng"])
async def add_post(user_id: int, title: str, content: str, db: AsyncSession = Depends(get_db)):
    new_post = Posts(user_id=user_id, title=title, content=content)
    db.add(new_post)
    await db.commit()
    return {"status": "success", "message": "Post added successfully"}

@app.delete("/delete-post",tags=["Bài đăng"])
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    post = await db.execute(select(Posts).where(Posts.id == post_id))
    post_to_delete = post.scalars().first()
    if post_to_delete:
        await db.delete(post_to_delete)
        await db.commit()
        return {"status": "success", "message": "Post deleted successfully"}
    else:
        return {"status": "fail", "message": "Post not found"}

# @app.post("/history",tags=["Lịch sử"])
# async def add_history(user_id: int, post_id: int,viewed_at:str, db: AsyncSession = Depends(get_db)):
#     """
#     Truyền vào user_id và post_id để thêm bài viết vào danh sách lịch sử.
#     Nếu bài viết đã tồn tại trong danh sách lịch sử, trả về thông báo lỗi.
#     Nếu không, thêm bài viết vào danh sách lịch sử.
#     """
#     existing_history = await db.execute(select(History).where(History.user_id == user_id, History.post_id == post_id))
#     if existing_history.scalars().first():
#         return {"status": "fail", "message": "History already exists"}
#     new_history = History(user_id=user_id, post_id=post_id, viewed_at=viewed_at)
#     db.add(new_history)
#     await db.commit()
#     return {"status": "success", "message": "History added successfully"}