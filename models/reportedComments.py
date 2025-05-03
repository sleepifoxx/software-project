from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class ReportedComments(Base):
    __tablename__ = 'ReportedComments'

    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("PostComments.id", ondelete='CASCADE'))
    reporter_id = Column(Integer, ForeignKey("Users.id", ondelete='CASCADE'))
    reported_at = Column(DateTime, default=func.now())
    description = Column(Text, nullable=False)

    reporter = relationship('Users', back_populates='comment_reports')
    reported_comment = relationship('PostComments', back_populates='reports')