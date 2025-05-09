from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
import uuid
from datetime import datetime

Base = declarative_base()

class Mushroom(Base):
    __tablename__ = 'mushrooms'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bruises = Column(String, nullable=True)
    odor = Column(String, nullable=True)
    gill_spacing = Column(String, nullable=True)
    gill_size = Column(String, nullable=True)
    gill_color = Column(String, nullable=True)
    stalk_root = Column(String, nullable=True)
    stalk_surface_above_ring = Column(String, nullable=True)
    stalk_surface_below_ring = Column(String, nullable=True)
    stalk_color_above_ring = Column(String, nullable=True)
    stalk_color_below_ring = Column(String, nullable=True)
    ring_type = Column(String, nullable=True)
    spore_print_color = Column(String, nullable=True)
    population = Column(String, nullable=True)
    habitat = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Prediction(Base):
    __tablename__ = 'predictions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mushroom_id = Column(UUID(as_uuid=True), ForeignKey('mushrooms.id'), nullable=False)
    prediction_result = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    mushroom = relationship('Mushroom', back_populates='predictions')

Mushroom.predictions = relationship('Prediction', back_populates='mushroom')
