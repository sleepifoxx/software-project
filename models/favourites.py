from sqlalchemy import Integer, ForeignKey, Column, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Favourites(Base):
    __tablename__ = 'Favourites'

    user_id = Column(Integer, ForeignKey('Users.id', ondelete='CASCADE'), primary_key=True)
    post_id = Column(Integer, ForeignKey('Posts.id', ondelete='CASCADE'), primary_key=True)
    added_at = Column(DateTime, default=func.now())

    user = relationship('Users', back_populates='user_favourites')
    post = relationship('Posts', back_populates='user_favourites')
