from app.database import Base
from sqlalchemy import Column, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship

class WaitingConvinience(Base):
    __tablename__ = 'WaitingConvinience'

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey('WaitingPosts.id', ondelete='CASCADE'))
    wifi = Column(Boolean, default=False)
    air_conditioner = Column(Boolean, default=False)
    fridge = Column(Boolean, default=False)
    washing_machine = Column(Boolean, default=False)
    parking_lot = Column(Boolean, default=False)
    security = Column(Boolean, default=False)
    kitchen = Column(Boolean, default=False)
    private_bathroom = Column(Boolean, default=False)
    furniture = Column(Boolean, default=False)
    bacony = Column(Boolean, default=False)
    elevator = Column(Boolean, default=False)
    pet_allowed = Column(Boolean, default=False)

    post = relationship('WaitingPosts', back_populates='convinience')