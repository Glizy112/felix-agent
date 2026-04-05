from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: str = ""
    priority: int = 5
    due_date: Optional[str] = None
    status: str = "pending"
    source: str = "manual"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    due_date: Optional[str] = None
    status: Optional[str] = None

class Task(TaskBase):
    id: int
    priority_score: int
    created_at: str
    completed_at: Optional[str] = None

    class Config:
        from_attributes = True

# Calendar Event Schemas
class CalendarEvent(BaseModel):
    id: str
    title: str
    start_time: str
    end_time: str
    description: str = ""
    location: str = ""

class CalendarEventDB(BaseModel):
    id: int
    event_id: str
    title: str
    start_time: str
    end_time: str
    description: str
    location: str
    synced_at: str

    class Config:
        from_attributes = True

# Agent Schemas
class AgentMessage(BaseModel):
    message: str

class AgentResponse(BaseModel):
    response: str
    suggestions: List[dict] = []

# Analytics Schemas
class DailyStats(BaseModel):
    date: str
    tasks_completed: int
    tasks_pending: int
    tasks_created: int
    calendar_events: int
    efficiency_score: float

class WeeklyStats(BaseModel):
    daily_breakdown: List[DailyStats]
    total_completed: int
    total_created: int
    trend: str  # "improving", "stable", "declining"

# Work Log Schema
class WorkLogCreate(BaseModel):
    task_id: Optional[int] = None
    action: str
    details: str = ""