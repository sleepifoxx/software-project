from sqlalchemy import Integer, String, ForeignKey, Column
from sqlalchemy.orm import relationship
from app.database import Base


class PostImages(Base):
    __tablename__ = 'PostImages'

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("Posts.id", ondelete='CASCADE'))
    image_url = Column(String, nullable=False)

    post = relationship("Posts", back_populates="images")
