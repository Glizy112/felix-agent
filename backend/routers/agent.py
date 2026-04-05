from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Task, CalendarEvent, WorkLog
from schemas import AgentMessage, AgentResponse, TaskCreate
from datetime import datetime
import random

router = APIRouter()

# Simple rule-based agent for prototype
# In production, this would use Google ADK

def analyze_calendar_and_suggest(db: Session) -> dict:
    """Analyze calendar events and suggest tasks."""
    events = db.query(CalendarEvent).order_by(CalendarEvent.start_time.asc()).all()
    suggestions = []
    
    for event in events:
        # Suggest preparation tasks for upcoming events
        suggestions.append({
            "title": f"Prepare for: {event.title}",
            "description": f"Review materials and prepare for '{event.title}' at {event.location}",
            "priority": 7,
            "due_date": event.start_time,
            "source": "agent",
            "related_event": event.title
        })
    
    return {"suggestions": suggestions, "count": len(suggestions)}

def process_agent_message(message: str, db: Session) -> AgentResponse:
    """Process user message and generate agent response."""
    message_lower = message.lower()
    
    # Calendar queries
    if any(word in message_lower for word in ["calendar", "schedule", "events", "meetings"]):
        events = db.query(CalendarEvent).order_by(CalendarEvent.start_time.asc()).all()
        if events:
            event_list = "\n".join([f"- {e.title} at {e.start_time}" for e in events[:5]])
            return AgentResponse(
                response=f"Here are your upcoming events:\n{event_list}",
                suggestions=[{"action": "view_calendar", "label": "View Full Calendar"}]
            )
        return AgentResponse(
            response="You don't have any calendar events synced yet. Let me fetch them for you.",
            suggestions=[{"action": "sync_calendar", "label": "Sync Calendar"}]
        )
    
    # Task queries
    if any(word in message_lower for word in ["task", "todo", "to-do"]):
        if "pending" in message_lower or "show" in message_lower:
            tasks = db.query(Task).filter(Task.status != "completed").order_by(Task.priority_score.desc()).all()
            if tasks:
                task_list = "\n".join([f"- {t.title} (Priority: {t.priority_score})" for t in tasks[:5]])
                return AgentResponse(
                    response=f"Here are your pending tasks:\n{task_list}",
                    suggestions=[]
                )
            return AgentResponse(response="You have no pending tasks. Great job!")
        
        if "completed" in message_lower or "done" in message_lower:
            completed = db.query(Task).filter(Task.status == "completed").count()
            return AgentResponse(response=f"You've completed {completed} tasks so far!")
    
    # Create task from message
    if any(word in message_lower for word in ["create", "add", "new task"]):
        # Extract task title from message
        task_title = message.replace("create", "").replace("add", "").replace("new task", "").strip()
        if task_title:
            return AgentResponse(
                response=f"I can help you create a task: '{task_title}'. Would you like to set a due date?",
                suggestions=[
                    {"action": "create_task", "title": task_title, "label": f"Create: {task_title}"}
                ]
            )
    
    # Productivity summary
    if any(word in message_lower for word in ["productivity", "summary", "how am i doing", "progress"]):
        completed = db.query(Task).filter(Task.status == "completed").count()
        pending = db.query(Task).filter(Task.status != "completed").count()
        events = db.query(CalendarEvent).count()
        return AgentResponse(
            response=f"Here's your productivity summary:\n- Completed tasks: {completed}\n- Pending tasks: {pending}\n- Calendar events: {events}\n\nKeep up the good work!",
            suggestions=[{"action": "view_dashboard", "label": "View Dashboard"}]
        )
    
    # Default response with smart suggestions
    events = db.query(CalendarEvent).order_by(CalendarEvent.start_time.asc()).limit(2).all()
    suggestions = []
    for event in events:
        suggestions.append({
            "action": "create_task",
            "title": f"Prepare for: {event.title}",
            "label": f"Add prep task for {event.title}"
        })
    
    return AgentResponse(
        response="I'm Felix, your personal productivity agent. I can help you manage tasks, check your calendar, and suggest actions based on your schedule. Try asking me about your calendar or tasks!",
        suggestions=suggestions if suggestions else [
            {"action": "view_tasks", "label": "View Tasks"},
            {"action": "view_calendar", "label": "View Calendar"},
            {"action": "view_dashboard", "label": "View Dashboard"}
        ]
    )

@router.post("/chat", response_model=AgentResponse)
def agent_chat(message: AgentMessage, db: Session = Depends(get_db)):
    """Chat with the Felix agent."""
    return process_agent_message(message.message, db)

@router.get("/suggestions")
def get_agent_suggestions(db: Session = Depends(get_db)):
    """Get proactive task suggestions based on calendar analysis."""
    return analyze_calendar_and_suggest(db)

@router.post("/create-task-from-suggestion")
def create_task_from_suggestion(suggestion: dict, db: Session = Depends(get_db)):
    """Create a task from an agent suggestion."""
    task = Task(
        title=suggestion.get("title", "Untitled Task"),
        description=suggestion.get("description", ""),
        priority=suggestion.get("priority", 5),
        priority_score=suggestion.get("priority", 5),
        due_date=suggestion.get("due_date"),
        source="agent",
        created_at=datetime.now().isoformat()
    )
    db.add(task)
    
    log = WorkLog(task_id=task.id, action="created", details=f"Task created from agent suggestion")
    db.add(log)
    db.commit()
    db.refresh(task)
    
    return {"message": "Task created from suggestion", "task": {"id": task.id, "title": task.title}}