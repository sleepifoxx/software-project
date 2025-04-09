from app.database import Base, engine  # Make sure database.py defines Base and engine
from app.models import users, posts, postImages, postComments, favourites  # Import all models

Base.metadata.create_all(bind=engine)