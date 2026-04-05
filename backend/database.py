from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./felix.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Task Model
class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    priority = Column(Integer, default=5)  # 1-10 scale
    priority_score = Column(Integer, default=5)  # Auto-calculated score
    due_date = Column(String(50), nullable=True)
    status = Column(String(20), default="pending")  # pending, in_progress, completed
    source = Column(String(50), default="manual")  # manual, agent, calendar
    created_at = Column(String(50), default=lambda: datetime.now().isoformat())
    completed_at = Column(String(50), nullable=True)

# Work Log Model
class WorkLog(Base):
    __tablename__ = "work_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=True)
    action = Column(String(50), default="")  # created, completed, updated
    timestamp = Column(String(50), default=lambda: datetime.now().isoformat())
    details = Column(Text, default="")

# Calendar Event Cache
class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(255), unique=True, index=True)
    title = Column(String(255), nullable=False)
    start_time = Column(String(50), nullable=False)
    end_time = Column(String(50), nullable=False)
    description = Column(Text, default="")
    location = Column(String(255), default="")
    synced_at = Column(String(50), default=lambda: datetime.now().isoformat())