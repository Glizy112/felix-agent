"""
Seed script to populate database with sample data for demo.
Run with: python seed.py
"""
from database import engine, Base, Task, WorkLog, CalendarEvent
from datetime import datetime, timedelta
import random

def seed_data():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    from sqlalchemy.orm import Session
    db = Session(bind=engine)
    
    # Check if data already exists
    if db.query(Task).count() > 0:
        print("Database already has data. Skipping seed.")
        return
    
    print("Seeding database with sample data...")
    
    # Sample Tasks
    tasks = [
        Task(
            title="Prepare presentation for client meeting",
            description="Create slides for Q1 review with Acme Corp",
            priority=8,
            priority_score=9,
            due_date=(datetime.now() + timedelta(days=1)).isoformat(),
            status="pending",
            source="manual",
            created_at=datetime.now().isoformat()
        ),
        Task(
            title="Review pull requests",
            description="Check and approve pending PRs from team",
            priority=6,
            priority_score=7,
            due_date=datetime.now().isoformat(),
            status="pending",
            source="manual",
            created_at=datetime.now().isoformat()
        ),
        Task(
            title="Prepare for: Team Standup",
            description="Review materials and prepare for 'Team Standup' at Google Meet",
            priority=7,
            priority_score=7,
            due_date=datetime.now().replace(hour=10, minute=0).isoformat(),
            status="completed",
            source="agent",
            created_at=(datetime.now() - timedelta(hours=2)).isoformat(),
            completed_at=(datetime.now() - timedelta(hours=1)).isoformat()
        ),
        Task(
            title="Update project documentation",
            description="Add new API endpoints and update architecture diagram",
            priority=5,
            priority_score=5,
            due_date=(datetime.now() + timedelta(days=3)).isoformat(),
            status="pending",
            source="manual",
            created_at=(datetime.now() - timedelta(days=1)).isoformat()
        ),
        Task(
            title="Prepare for: Project Review",
            description="Review materials and prepare for 'Project Review' at Conference Room A",
            priority=7,
            priority_score=8,
            due_date=datetime.now().replace(hour=14, minute=0).isoformat(),
            status="pending",
            source="agent",
            created_at=datetime.now().isoformat()
        ),
        Task(
            title="Fix login bug reported by QA",
            description="Investigate and fix the authentication timeout issue",
            priority=9,
            priority_score=10,
            due_date=datetime.now().isoformat(),
            status="in_progress",
            source="manual",
            created_at=(datetime.now() - timedelta(days=2)).isoformat()
        ),
        Task(
            title="Write unit tests for payment module",
            description="Add test coverage for payment processing functions",
            priority=4,
            priority_score=4,
            due_date=(datetime.now() + timedelta(days=5)).isoformat(),
            status="pending",
            source="manual",
            created_at=(datetime.now() - timedelta(days=1)).isoformat()
        ),
        Task(
            title="Send weekly report to manager",
            description="Compile progress and blockers for the week",
            priority=6,
            priority_score=6,
            due_date=(datetime.now() + timedelta(days=2)).isoformat(),
            status="pending",
            source="manual",
            created_at=datetime.now().isoformat()
        ),
    ]
    
    for task in tasks:
        db.add(task)
    
    # Sample Calendar Events
    today = datetime.now()
    events = [
        CalendarEvent(
            event_id="demo_1",
            title="Team Standup",
            start_time=today.replace(hour=10, minute=0).isoformat(),
            end_time=today.replace(hour=10, minute=30).isoformat(),
            description="Daily team sync meeting - discuss progress and blockers",
            location="Google Meet",
            synced_at=datetime.now().isoformat()
        ),
        CalendarEvent(
            event_id="demo_2",
            title="Project Review",
            start_time=today.replace(hour=14, minute=0).isoformat(),
            end_time=today.replace(hour=15, minute=0).isoformat(),
            description="Review sprint progress and plan next iteration",
            location="Conference Room A",
            synced_at=datetime.now().isoformat()
        ),
        CalendarEvent(
            event_id="demo_3",
            title="Client Call - Acme Corp",
            start_time=today.replace(hour=16, minute=0).isoformat(),
            end_time=today.replace(hour=16, minute=45).isoformat(),
            description="Discuss project requirements and timeline",
            location="Phone",
            synced_at=datetime.now().isoformat()
        ),
    ]
    
    for event in events:
        db.add(event)
    
    # Sample Work Logs
    logs = [
        WorkLog(task_id=3, action="created", details="Task created from agent suggestion"),
        WorkLog(task_id=3, action="completed", details="Task 'Prepare for: Team Standup' completed"),
        WorkLog(task_id=6, action="created", details="Task 'Fix login bug' created"),
    ]
    
    for log in logs:
        db.add(log)
    
    db.commit()
    print(f"Seeded {len(tasks)} tasks, {len(events)} calendar events, and {len(logs)} work logs.")
    print("Database ready for demo!")

if __name__ == "__main__":
    seed_data()