from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func, delete, update
from database import get_db
from typing import Optional, List
from datetime import date
from models.users import Users
from models.posts import Posts
from models.favourites import Favourites
from models.postComments import PostComments
from models.postImages import PostImages
from models.history import History
from models.convinience import Convinience
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form
from pydantic import BaseModel
from typing import List
from fastapi import FastAPI, File, UploadFile, Form
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder


app = FastAPI(title="Nhatro.vn API", description="API for Nhatro.vn")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # dùng chính xác domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ImageInput(BaseModel):
    post_id: int
    image_urls: List[str]
# ----- USER ENDPOINTS -----
@app.get("/login", tags=["Tài khoản"])
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


@app.post("/signup", tags=["Tài khoản"])
async def signup(email: str, password: str, contact_number: Optional[str] = None, full_name: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào email, password để đăng ký tài khoản mới.
    contact_number và full_name là các trường tùy chọn.
    Nếu email đã tồn tại, trả về thông báo lỗi.
    Nếu không, tạo tài khoản mới và lưu vào cơ sở dữ liệu.
    """
    existing_user = await db.execute(select(Users).where(Users.email == email))
    if existing_user.scalars().first():
        return {"status": "fail", "message": "Email already exists"}

    new_user = Users(email=email, password=password, contact_number=contact_number, full_name=full_name)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"status": "success", "message": "User created successfully", "user": new_user}

@app.put("/update-user", tags=["Tài khoản"])
async def update_user(
    user_id: int, 
    password: str,
    email: Optional[str] = None,
    contact_number: Optional[str] = None, 
    full_name: Optional[str] = None, 
    avatar_url: Optional[str] = None, 
    address: Optional[str] = None, 
    gender: Optional[str] = None, 
    birthday: Optional[date] = None, 
    db: AsyncSession = Depends(get_db)
):
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
        await db.refresh(user_to_update)
        return {"status": "success", "message": "User updated successfully", "user": user_to_update}
    else:
        return {"status": "fail", "message": "User not found"}
    

@app.get("/get-user-info", tags=["Tài khoản"])
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

@app.get("/list-users", tags=["Tài khoản"])
async def list_users(limit: int = 10, offset: int = 0, db: AsyncSession = Depends(get_db)):
    """
    Lấy danh sách người dùng với phân trang.
    """
    result = await db.execute(select(Users).limit(limit).offset(offset))
    users = result.scalars().all()
    return {"status": "success", "users": users, "count": len(users)}

@app.delete("/delete-user/{user_id}", tags=["Tài khoản"])
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Xóa người dùng theo ID.
    """
    user = await db.execute(select(Users).where(Users.id == user_id))
    user_to_delete = user.scalars().first()
    if user_to_delete:
        await db.delete(user_to_delete)
        await db.commit()
        return {"status": "success", "message": "User deleted successfully"}
    else:
        return {"status": "fail", "message": "User not found"}


# ----- POST ENDPOINTS -----
@app.get("/get-list-of-posts", tags=["Bài đăng"])
async def get_list_of_posts(limit: int, offset: int = 0, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào limit và offset để phân trang danh sách bài viết.
    """
    if limit <= 0:
        return {"status": "fail", "message": "Limit must be greater than 0"}
    
    result = await db.execute(
        select(Posts).order_by(desc(Posts.id)).offset(offset).limit(limit)
    )
    posts = result.scalars().all()
    return {"status": "success", "posts": posts}


@app.get("/get-posts-by-user", tags=["Bài đăng"])
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
    
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from fastapi.encoders import jsonable_encoder
from database import get_db
from models.posts import Posts

@app.get("/get-post-by-id", tags=["Bài đăng"])
async def get_post_by_id(post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Truyền vào post_id để lấy thông tin bài viết.
    Nếu tìm thấy bài viết, trả về thông tin của bài viết đó.
    Nếu không tìm thấy, trả về thông báo lỗi.
    """
    result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = result.scalars().first()
    if post:
        return {
            "status": "success",
            "post": jsonable_encoder(post)  # CHUYỂN VỀ DẠNG JSON
        }
    else:
        return {
            "status": "fail",
            "message": "Post not found"
        }


@app.post("/create-post", tags=["Bài đăng"])
async def create_post(
    user_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    price: int = Form(...),
    room_num: int = Form(...),
    type: str = Form(...),
    deposit: str = Form(...),
    electricity_fee: int = Form(...),
    water_fee: int = Form(...),
    internet_fee: int = Form(...),
    vehicle_fee: int = Form(...),
    province: str = Form(...),
    district: str = Form(...),
    rural: str = Form(...),
    street: str = Form(...),
    detailed_address: str = Form(...),
    floor_num: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Tạo một bài đăng mới với thông tin cơ bản.
    """
    # Check if user exists
    user_result = await db.execute(select(Users).where(Users.id == user_id))
    user = user_result.scalars().first()
    if not user:
        return {"status": "fail", "message": "User not found"}
    
    new_post = Posts(
        user_id=user_id,
        title=title,
        description=description,
        price=price,
        room_num=room_num,
        type=type,
        deposit=deposit,
        electricity_fee=electricity_fee,
        water_fee=water_fee,
        internet_fee=internet_fee,
        vehicle_fee=vehicle_fee,
        floor_num=floor_num,
        province=province,
        district=district,
        rural=rural,
        street=street,
        detailed_address=detailed_address
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)
    return {"status": "success", "message": "Post created successfully", "post": new_post}

@app.put("/update-post/{post_id}", tags=["Bài đăng"])
async def update_post(
    post_id: int,
    title: str,
    description: str,
    price: int,
    room_num: int,
    type: str,
    deposit: str,  # Changed to str to match model
    electricity_fee: int,
    water_fee: int,
    internet_fee: int,
    vehicle_fee: int,
    province: str,
    district: str,
    rural: str,
    street: str,
    detailed_address: str,  # Required field
    floor_num: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Cập nhật thông tin bài đăng.
    """
    result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = result.scalars().first()
    if not post:
        return {"status": "fail", "message": "Post not found"}
    
    post.title = title
    post.description = description
    post.price = price
    post.room_num = room_num
    post.type = type
    post.deposit = deposit
    post.electricity_fee = electricity_fee
    post.water_fee = water_fee
    post.internet_fee = internet_fee
    post.vehicle_fee = vehicle_fee
    post.floor_num = floor_num
    post.province = province
    post.district = district
    post.rural = rural
    post.street = street
    post.detailed_address = detailed_address
    
    await db.commit()
    await db.refresh(post)
    return {"status": "success", "message": "Post updated successfully", "post": post}

@app.delete("/delete-post/{post_id}", tags=["Bài đăng"])
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Xóa bài đăng theo ID.
    """
    result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = result.scalars().first()
    if post:
        await db.delete(post)
        await db.commit()
        return {"status": "success", "message": "Post deleted successfully"}
    else:
        return {"status": "fail", "message": "Post not found"}

@app.get("/search-posts", tags=["Bài đăng"])
async def search_posts(
    province: Optional[str] = None,
    district: Optional[str] = None,
    rural: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    type: Optional[str] = None,
    room_num: Optional[int] = None,
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Tìm kiếm bài đăng theo các tiêu chí.
    """
    query = select(Posts)
    
    if province:
        query = query.where(Posts.province == province)
    if district:
        query = query.where(Posts.district == district)
    if rural:
        query = query.where(Posts.rural == rural)
    if min_price is not None:
        query = query.where(Posts.price >= min_price)
    if max_price is not None:
        query = query.where(Posts.price <= max_price)
    if type:
        query = query.where(Posts.type == type)
    if room_num:
        query = query.where(Posts.room_num == room_num)
        
    # Add pagination
    query = query.order_by(desc(Posts.post_date)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    posts = result.scalars().all()
    return {"status": "success", "posts": posts, "count": len(posts)}

@app.get("/get-posts-by-filter", tags=["Bài đăng"])
async def get_posts_by_filter(
    limit: int = 10, 
    offset: int = 0,
    province: Optional[str] = None,
    district: Optional[str] = None, 
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    room_num: Optional[int] = None,
    has_wifi: Optional[bool] = None,
    has_ac: Optional[bool] = None,
    has_parking: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Lấy danh sách bài đăng với bộ lọc phức tạp bao gồm cả tiện ích.
    """
    query = select(Posts)
    
    # Apply basic filters
    if province:
        query = query.where(Posts.province == province)
    if district:
        query = query.where(Posts.district == district)
    if min_price is not None:
        query = query.where(Posts.price >= min_price)
    if max_price is not None:
        query = query.where(Posts.price <= max_price)
    if room_num is not None:
        query = query.where(Posts.room_num == room_num)
    
    # Apply convenience filters if specified
    if any([has_wifi, has_ac, has_parking]):
        query = query.join(Convinience, Posts.id == Convinience.post_id)
        
        if has_wifi:
            query = query.where(Convinience.wifi == True)
        if has_ac:
            query = query.where(Convinience.air_conditioner == True)
        if has_parking:
            query = query.where(Convinience.parking_lot == True)
    
    # Apply pagination
    query = query.order_by(desc(Posts.post_date)).offset(offset).limit(limit)
    
    result = await db.execute(query)
    posts = result.scalars().all()
    
    return {"status": "success", "posts": posts, "count": len(posts)}


# ----- POST IMAGES ENDPOINTS -----
@app.post("/add-post-image", tags=["Hình ảnh"])
async def add_post_image(post_id: int, image_url: str, db: AsyncSession = Depends(get_db)):
    """
    Thêm hình ảnh cho bài đăng.
    """
    # Verify post exists
    post_result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = post_result.scalars().first()
    if not post:
        return {"status": "fail", "message": "Post not found"}
    
    new_image = PostImages(post_id=post_id, image_url=image_url)
    db.add(new_image)
    await db.commit()
    await db.refresh(new_image)
    return {"status": "success", "message": "Image added successfully", "image": new_image}


@app.post("/add-post-images", tags=["Hình ảnh"])
async def add_post_images(
    post_id: int = Form(...),
    images: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    post_result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = post_result.scalars().first()
    if not post:
        return {"status": "fail", "message": "Post not found"}

    new_images = []
    for img in images:
        filename = img.filename  # hoặc xử lý nội dung bằng `await img.read()`
        new_image = PostImages(post_id=post_id, image_url=filename)
        db.add(new_image)
        new_images.append(new_image)

    await db.commit()
    return {
        "status": "success",
        "message": f"Added {len(new_images)} images successfully"
    }

@app.get("/get-post-images/{post_id}", tags=["Hình ảnh"])
async def get_post_images(post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Lấy tất cả hình ảnh của một bài đăng.
    """
    result = await db.execute(select(PostImages).where(PostImages.post_id == post_id))
    images = result.scalars().all()
    return {"status": "success", "images": images}

@app.delete("/delete-post-image/{image_id}", tags=["Hình ảnh"])
async def delete_post_image(image_id: int, db: AsyncSession = Depends(get_db)):
    """
    Xóa hình ảnh theo ID.
    """
    result = await db.execute(select(PostImages).where(PostImages.id == image_id))
    image = result.scalars().first()
    if image:
        await db.delete(image)
        await db.commit()
        return {"status": "success", "message": "Image deleted successfully"}
    else:
        return {"status": "fail", "message": "Image not found"}


# ----- COMMENTS AND RATINGS ENDPOINTS -----
@app.post("/add-comment", tags=["Bình luận"])
async def add_comment(
    post_id: int, 
    user_id: int, 
    rating: float, 
    comment: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Thêm bình luận và đánh giá cho bài đăng.
    """
    # Check if post and user exist
    post_result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = post_result.scalars().first()
    if not post:
        return {"status": "fail", "message": "Post not found"}
    
    user_result = await db.execute(select(Users).where(Users.id == user_id))
    user = user_result.scalars().first()
    if not user:
        return {"status": "fail", "message": "User not found"}
    
    # Check if user already commented on this post
    existing_comment = await db.execute(
        select(PostComments).where(
            PostComments.post_id == post_id,
            PostComments.user_id == user_id
        )
    )
    if existing_comment.scalars().first():
        return {"status": "fail", "message": "User already commented on this post"}
    
    new_comment = PostComments(
        post_id=post_id,
        user_id=user_id,
        rating=rating,
        comment=comment
    )
    db.add(new_comment)
    
    # Update post average rating
    avg_rating_query = select(func.avg(PostComments.rating)).where(PostComments.post_id == post_id)
    avg_rating_result = await db.execute(avg_rating_query)
    avg_rating = avg_rating_result.scalar()
    post.avg_rating = avg_rating
    
    await db.commit()
    await db.refresh(new_comment)
    return {"status": "success", "message": "Comment added successfully", "comment": new_comment}

@app.get("/get-post-comments/{post_id}", tags=["Bình luận"])
async def get_post_comments(post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Lấy tất cả bình luận của một bài đăng.
    """
    result = await db.execute(select(PostComments).where(PostComments.post_id == post_id))
    comments = result.scalars().all()
    return {"status": "success", "comments": comments}

@app.put("/update-comment/{comment_id}", tags=["Bình luận"])
async def update_comment(
    comment_id: int,
    rating: float,
    comment: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Cập nhật bình luận và đánh giá.
    """
    result = await db.execute(select(PostComments).where(PostComments.id == comment_id))
    comment_obj = result.scalars().first()
    if not comment_obj:
        return {"status": "fail", "message": "Comment not found"}
    
    comment_obj.rating = rating
    comment_obj.comment = comment
    
    # Update post average rating
    post_id = comment_obj.post_id
    avg_rating_query = select(func.avg(PostComments.rating)).where(PostComments.post_id == post_id)
    avg_rating_result = await db.execute(avg_rating_query)
    avg_rating = avg_rating_result.scalar()
    
    post_result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = post_result.scalars().first()
    post.avg_rating = avg_rating
    
    await db.commit()
    await db.refresh(comment_obj)
    return {"status": "success", "message": "Comment updated successfully", "comment": comment_obj}

@app.delete("/delete-comment/{comment_id}", tags=["Bình luận"])
async def delete_comment(comment_id: int, db: AsyncSession = Depends(get_db)):
    """
    Xóa bình luận theo ID.
    """
    result = await db.execute(select(PostComments).where(PostComments.id == comment_id))
    comment = result.scalars().first()
    if not comment:
        return {"status": "fail", "message": "Comment not found"}
    
    post_id = comment.post_id
    await db.delete(comment)
    await db.commit()
    
    # Update post average rating
    avg_rating_query = select(func.avg(PostComments.rating)).where(PostComments.post_id == post_id)
    avg_rating_result = await db.execute(avg_rating_query)
    avg_rating = avg_rating_result.scalar() or 0
    
    post_result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = post_result.scalars().first()
    if post:
        post.avg_rating = avg_rating
        await db.commit()
    
    return {"status": "success", "message": "Comment deleted successfully"}


# ----- FAVOURITES ENDPOINTS -----
@app.post("/add-favourite", tags=["Yêu thích"])
async def add_favourite(user_id: int, post_id: int, db: AsyncSession = Depends(get_db)):
    # Kiểm tra bài viết tồn tại
    post_result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = post_result.scalars().first()
    if not post:
        return {"status": "fail", "message": "Post not found"}

    # Kiểm tra người dùng tồn tại
    user_result = await db.execute(select(Users).where(Users.id == user_id))
    user = user_result.scalars().first()
    if not user:
        return {"status": "fail", "message": "User not found"}

    # Nếu đã tồn tại thì vẫn trả về success để tránh lỗi phía client
    existing_fav = await db.execute(
        select(Favourites).where(
            Favourites.post_id == post_id,
            Favourites.user_id == user_id
        )
    )
    if existing_fav.scalars().first():
        return {"status": "success", "message": "Đã tồn tại trong danh sách yêu thích"}

    new_favourite = Favourites(user_id=user_id, post_id=post_id)
    db.add(new_favourite)
    await db.commit()
    return {"status": "success", "message": "Đã thêm vào danh sách yêu thích"}



@app.delete("/remove-favourite", tags=["Yêu thích"])
async def remove_favourite(user_id: int, post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Xóa bài đăng khỏi danh sách yêu thích.
    """
    result = await db.execute(
        select(Favourites).where(
            Favourites.user_id == user_id,
            Favourites.post_id == post_id
        )
    )
    favourite = result.scalars().first()
    if favourite:
        await db.delete(favourite)
        await db.commit()
        return {"status": "success", "message": "Removed from favourites successfully"}
    else:
        return {"status": "fail", "message": "Favourite not found"}


# ----- HISTORY ENDPOINTS -----
@app.post("/add-history", tags=["Lịch sử"])
async def add_history(user_id: int, post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Thêm bài đăng vào lịch sử xem của người dùng.
    """
    # Check if post and user exist
    post_result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = post_result.scalars().first()
    if not post:
        return {"status": "fail", "message": "Post not found"}
    
    user_result = await db.execute(select(Users).where(Users.id == user_id))
    user = user_result.scalars().first()
    if not user:
        return {"status": "fail", "message": "User not found"}
    
    # Check if already in history and update timestamp if it is
    existing_history = await db.execute(
        select(History).where(
            History.post_id == post_id,
            History.user_id == user_id
        )
    )
    history_entry = existing_history.scalars().first()
    
    if history_entry:
        # Update timestamp
        history_entry.viewed_at = func.now()
    else:
        # Create new entry
        new_history = History(user_id=user_id, post_id=post_id)
        db.add(new_history)
    
    await db.commit()
    return {"status": "success", "message": "History updated successfully"}

@app.get("/get-user-history/{user_id}", tags=["Lịch sử"])
async def get_user_history(user_id: int, limit: int = 10, db: AsyncSession = Depends(get_db)):
    """
    Lấy lịch sử xem của người dùng.
    """
    # Join History with Posts to get full post information and sort by viewed_at descending
    query = select(Posts, History.viewed_at).join(
        History, Posts.id == History.post_id
    ).where(
        History.user_id == user_id
    ).order_by(
        desc(History.viewed_at)
    ).limit(limit)
    
    result = await db.execute(query)
    history_items = [(post, viewed_at) for post, viewed_at in result]
    
    # Format response
    history = [
        {
            "post": post,
            "viewed_at": viewed_at
        }
        for post, viewed_at in history_items
    ]
    
    return {"status": "success", "history": history}

@app.delete("/clear-user-history/{user_id}", tags=["Lịch sử"])
async def clear_user_history(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Xóa toàn bộ lịch sử xem của người dùng.
    """
    stmt = delete(History).where(History.user_id == user_id)
    await db.execute(stmt)
    await db.commit()
    return {"status": "success", "message": "History cleared successfully"}


# ----- CONVENIENCE ENDPOINTS -----
@app.post("/add-convenience", tags=["Tiện ích"])
async def add_convenience(
    post_id: int,
    wifi: bool = False,
    air_conditioner: bool = False,
    fridge: bool = False,
    washing_machine: bool = False,
    parking_lot: bool = False,
    security: bool = False,
    kitchen: bool = False,
    private_bathroom: bool = False,
    furniture: bool = False,
    bacony: bool = False,
    elevator: bool = False,
    pet_allowed: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """
    Thêm thông tin tiện ích cho bài đăng.
    """
    # Check if post exists
    post_result = await db.execute(select(Posts).where(Posts.id == post_id))
    post = post_result.scalars().first()
    if not post:
        return {"status": "fail", "message": "Post not found"}
    
    # Check if convenience already exists for this post
    convenience_result = await db.execute(select(Convinience).where(Convinience.post_id == post_id))
    existing_convenience = convenience_result.scalars().first()
    
    if existing_convenience:
        return {"status": "fail", "message": "Convenience information already exists for this post, use update endpoint instead"}
    
    try:
        new_convenience = Convinience(
            post_id=post_id,
            wifi=wifi,
            air_conditioner=air_conditioner,
            fridge=fridge,
            washing_machine=washing_machine,
            parking_lot=parking_lot,
            security=security,
            kitchen=kitchen,
            private_bathroom=private_bathroom,
            furniture=furniture,
            bacony=bacony,
            elevator=elevator,
            pet_allowed=pet_allowed
        )
        
        db.add(new_convenience)
        await db.commit()
        await db.refresh(new_convenience)
        return {"status": "success", "message": "Convenience information added successfully", "convenience": new_convenience}
    except Exception as e:
        return {"status": "fail", "message": f"Error creating convenience: {str(e)}"}

@app.get("/get-post-convenience/{post_id}", tags=["Tiện ích"])
async def get_post_convenience(post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Lấy thông tin tiện ích của bài đăng.
    """
    result = await db.execute(select(Convinience).where(Convinience.post_id == post_id))
    convenience = result.scalars().first()
    if convenience:
        return {"status": "success", "convenience": convenience}
    else:
        return {"status": "fail", "message": "Convenience information not found for this post"}

@app.put("/update-convenience/{post_id}", tags=["Tiện ích"])
async def update_convenience(
    post_id: int,
    wifi: bool = False,
    air_conditioner: bool = False,
    fridge: bool = False,
    washing_machine: bool = False,
    parking_lot: bool = False,
    security: bool = False,
    kitchen: bool = False,
    private_bathroom: bool = False,
    furniture: bool = False,
    bacony: bool = False,
    elevator: bool = False,
    pet_allowed: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """
    Cập nhật thông tin tiện ích cho bài đăng.
    """
    result = await db.execute(select(Convinience).where(Convinience.post_id == post_id))
    convenience = result.scalars().first()
    if not convenience:
        return {"status": "fail", "message": "Convenience information not found for this post"}
    
    convenience.wifi = wifi
    convenience.air_conditioner = air_conditioner
    convenience.fridge = fridge
    convenience.washing_machine = washing_machine
    convenience.parking_lot = parking_lot
    convenience.security = security
    convenience.kitchen = kitchen
    convenience.private_bathroom = private_bathroom
    convenience.furniture = furniture
    convenience.bacony = bacony
    convenience.elevator = elevator
    convenience.pet_allowed = pet_allowed
    
    await db.commit()
    await db.refresh(convenience)
    return {"status": "success", "message": "Convenience information updated successfully", "convenience": convenience}

@app.delete("/delete-convenience/{post_id}", tags=["Tiện ích"])
async def delete_convenience(post_id: int, db: AsyncSession = Depends(get_db)):
    """
    Xóa thông tin tiện ích của bài đăng.
    """
    result = await db.execute(select(Convinience).where(Convinience.post_id == post_id))
    convenience = result.scalars().first()
    if convenience:
        await db.delete(convenience)
        await db.commit()
        return {"status": "success", "message": "Convenience information deleted successfully"}
    else:
        return {"status": "fail", "message": "Convenience information not found for this post"}

@app.get("/get-user-favourites/{user_id}", tags=["Yêu thích"])
async def get_user_favourites(user_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Favourites).where(Favourites.user_id == user_id)
    result = await db.execute(query)
    posts_id = result.scalars().all()
    return {"status": "success", "favourites": posts_id}

# ----- STATISTICS ENDPOINTS -----
@app.get("/get-user-stats/{user_id}", tags=["Thống kê"])
async def get_user_stats(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Lấy thống kê về hoạt động của người dùng.
    """
    # Check if user exists
    user_result = await db.execute(select(Users).where(Users.id == user_id))
    user = user_result.scalars().first()
    if not user:
        return {"status": "fail", "message": "User not found"}
    
    # Get posts count
    posts_query = select(func.count(Posts.id)).where(Posts.user_id == user_id)
    posts_count = await db.execute(posts_query)
    posts_count = posts_count.scalar() or 0
    
    # Get comments count
    comments_query = select(func.count(PostComments.id)).where(PostComments.user_id == user_id)
    comments_count = await db.execute(comments_query)
    comments_count = comments_count.scalar() or 0
    
    # Get favorites count
    favorites_query = select(func.count(Favourites.post_id)).where(Favourites.user_id == user_id)
    favorites_count = await db.execute(favorites_query)
    favorites_count = favorites_count.scalar() or 0
    
    # Get history count
    history_query = select(func.count(History.post_id)).where(History.user_id == user_id)
    history_count = await db.execute(history_query)
    history_count = history_count.scalar() or 0
    
    return {
        "status": "success",
        "stats": {
            "posts_count": posts_count,
            "comments_count": comments_count,
            "favorites_count": favorites_count,
            "history_count": history_count
        }
    }

