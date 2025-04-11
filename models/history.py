from sqlalchemy import Integer, ForeignKey, Column, DateTime, func
from sqlalchemy.orm import relationship
from database import Base


class History(Base):
    __tablename__ = 'History'

    user_id = Column(Integer, ForeignKey('Users.id', ondelete='CASCADE'), primary_key=True)
    post_id = Column(Integer, ForeignKey('Posts.id', ondelete='CASCADE'), primary_key=True)
    viewed_at = Column(DateTime, default=func.now())

    user = relationship('Users', back_populates='user_history')
    post = relationship('Posts', back_populates='user_history')
