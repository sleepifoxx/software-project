from sqlalchemy import Column, Integer, String, Date, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Users(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=True)
    password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    birthday = Column(Date, nullable=True)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    is_admin = Column(Boolean, default=False)

    posts = relationship('Posts', back_populates='owner', cascade='all, delete-orphan')
    comments = relationship('PostComments', back_populates='user', cascade='all, delete-orphan')
    user_favourites = relationship('Favourites', back_populates='user', cascade='all, delete-orphan')
    user_history = relationship('History', back_populates='user', cascade='all, delete-orphan')