from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, func
from sqlalchemy.orm import relationship
from database import Base


class Posts(Base):
    __tablename__ = 'Posts'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.id", ondelete='CASCADE'))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(String, nullable=False)
    room_num = Column(Integer, nullable=False)
    avg_rating = Column(Float, nullable=True)
    post_date = Column(DateTime, default=func.now())
    views = Column(Integer, default=0)
    type = Column(String, nullable=False)
    deposit = Column(String, nullable=False)
    electricity_fee = Column(String, nullable=False)
    water_fee = Column(String, nullable=False)
    internet_fee = Column (String, nullable=False)
    vehicle_fee = Column(String, nullable=False)
    floor_num = Column(String, nullable=True)
    province = Column(String, nullable=False)
    district = Column(String, nullable=False)
    rural = Column(String, nullable=False)
    street = Column(String, nullable=False)
    detailed_address = Column(String, nullable=False)

    owner = relationship('Users', back_populates='posts')
    images = relationship('PostImages', back_populates='post', cascade='all, delete-orphan')
    comments = relationship('PostComments', back_populates='post', cascade='all, delete-orphan')
    user_favourites = relationship('Favourites', back_populates='post', cascade='all, delete-orphan')
    user_history = relationship('History', back_populates='post', cascade='all, delete-orphan')
    convinience = relationship('Convinience', back_populates='post', cascade='all, delete-orphan')
