from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class ReportedPosts(Base):
    __tablename__ = 'ReportedPosts'

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("Posts.id", ondelete='CASCADE'))
    reporter_id = Column(Integer, ForeignKey("Users.id", ondelete='CASCADE'))
    reported_at = Column(DateTime, default=func.now())
    description = Column(Text, nullable=False)

    reporter = relationship('Users', back_populates='post_reports')
    reported_post = relationship('Posts', back_populates='reports')