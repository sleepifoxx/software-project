from sqlalchemy import Integer, String, ForeignKey, Column
from sqlalchemy.orm import relationship
from app.database import Base


class WaitingImages(Base):
    __tablename__ = 'WaitingImages'

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("WaitingPosts.id", ondelete='CASCADE'))
    image_url = Column(String, nullable=False)

    post = relationship("WaitingPosts", back_populates="images")