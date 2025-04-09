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
    address = Column(String, nullable=False)
    room_num = Column(Integer, nullable=False)
    avg_rating = Column(Float, nullable=True)
    post_date = Column(DateTime, default=func.now())

    owner = relationship('Users', back_populates='posts')
    images = relationship('PostImages', back_populates='post',
                          cascade='all, delete-orphan')
    comments = relationship(
        'PostComments', back_populates='post', cascade='all, delete-orphan')
    user_favourites = relationship(
        'Favourites', back_populates='post', cascade='all, delete')
