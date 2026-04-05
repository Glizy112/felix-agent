from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Task, WorkLog, CalendarEvent
from schemas import DailyStats, WeeklyStats
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

@router.get("/today", response_model=DailyStats)
def get_today_stats(db: Session = Depends(get_db)):
    """Get today's productivity statistics."""
    today = datetime.now().date().isoformat()
    
    tasks_completed = db.query(Task).filter(
        Task.status == "completed",
        Task.completed_at.like(f"{today}%")
    ).count()
    
    tasks_pending = db.query(Task).filter(Task.status != "completed").count()
    tasks_created = db.query(Task).filter(Task.created_at.like(f"{today}%")).count()
    calendar_events = db.query(CalendarEvent).filter(
        CalendarEvent.start_time.like(f"{today}%")
    ).count()
    
    # Calculate efficiency score (0-100)
    total_tasks = tasks_completed + tasks_pending
    efficiency = (tasks_completed / total_tasks * 100) if total_tasks > 0 else 0
    
    return DailyStats(
        date=today,
        tasks_completed=tasks_completed,
        tasks_pending=tasks_pending,
        tasks_created=tasks_created,
        calendar_events=calendar_events,
        efficiency_score=round(efficiency, 1)
    )

@router.get("/weekly", response_model=WeeklyStats)
def get_weekly_stats(db: Session = Depends(get_db)):
    """Get last 7 days productivity statistics."""
    daily_breakdown = []
    total_completed = 0
    total_created = 0
    
    for i in range(6, -1, -1):
        date = (datetime.now() - timedelta(days=i)).date().isoformat()
        
        completed = db.query(Task).filter(
            Task.status == "completed",
            Task.completed_at.like(f"{date}%")
        ).count()
        
        created = db.query(Task).filter(Task.created_at.like(f"{date}%")).count()
        pending = db.query(Task).filter(Task.status != "completed").count()
        events = db.query(CalendarEvent).filter(
            CalendarEvent.start_time.like(f"{date}%")
        ).count()
        
        total = completed + pending
        efficiency = (completed / total * 100) if total > 0 else 0
        
        daily_breakdown.append(DailyStats(
            date=date,
            tasks_completed=completed,
            tasks_pending=pending,
            tasks_created=created,
            calendar_events=events,
            efficiency_score=round(efficiency, 1)
        ))
        
        total_completed += completed
        total_created += created
    
    # Determine trend
    if len(daily_breakdown) >= 2:
        recent = daily_breakdown[-1].tasks_completed
        older = daily_breakdown[-2].tasks_completed
        if recent > older:
            trend = "improving"
        elif recent < older:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"
    
    return WeeklyStats(
        daily_breakdown=daily_breakdown,
        total_completed=total_completed,
        total_created=total_created,
        trend=trend
    )

@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    """Get overall summary statistics."""
    total_tasks = db.query(Task).count()
    completed = db.query(Task).filter(Task.status == "completed").count()
    pending = db.query(Task).filter(Task.status != "completed").count()
    total_events = db.query(CalendarEvent).count()
    
    # Get tasks by source
    manual_tasks = db.query(Task).filter(Task.source == "manual").count()
    agent_tasks = db.query(Task).filter(Task.source == "agent").count()
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "completion_rate": round((completed / total_tasks * 100) if total_tasks > 0 else 0, 1),
        "total_events": total_events,
        "tasks_by_source": {
            "manual": manual_tasks,
            "agent": agent_tasks
        }
    }