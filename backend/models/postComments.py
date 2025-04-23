from sqlalchemy import Integer, Column, String, ForeignKey, Float, func, DateTime
from sqlalchemy.orm import relationship
from database import Base


class PostComments(Base):
    __tablename__ = 'PostComments'

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("Posts.id", ondelete='CASCADE'))
    user_id = Column(Integer, ForeignKey('Users.id', ondelete='CASCADE'))
    rating = Column(Float, nullable=False)
    comment = Column(String, nullable=True)
    comment_date = Column(DateTime, default=func.now())

    post = relationship('Posts', back_populates='comments')
    user = relationship('Users', back_populates='comments')
