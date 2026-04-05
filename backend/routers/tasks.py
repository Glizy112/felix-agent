from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, Task, WorkLog
from schemas import TaskCreate, TaskUpdate, Task as TaskSchema, WorkLogCreate
from datetime import datetime

router = APIRouter()

def calculate_priority_score(task: TaskCreate) -> int:
    """Calculate priority score based on priority, due date, and other factors."""
    score = task.priority  # Base score 1-10
    
    # Boost score if due date is near
    if task.due_date:
        try:
            due = datetime.fromisoformat(task.due_date)
            now = datetime.now()
            days_until_due = (due - now).days
            if days_until_due <= 0:
                score = min(10, score + 3)  # Overdue
            elif days_until_due == 1:
                score = min(10, score + 2)  # Due tomorrow
            elif days_until_due <= 3:
                score = min(10, score + 1)  # Due within 3 days
        except:
            pass
    
    return score

@router.get("/", response_model=List[TaskSchema])
def get_tasks(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Get all tasks sorted by priority score (highest first)."""
    tasks = db.query(Task).order_by(Task.priority_score.desc(), Task.due_date.asc()).offset(skip).limit(limit).all()
    return tasks

@router.post("/", response_model=TaskSchema)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task with auto-calculated priority score."""
    priority_score = calculate_priority_score(task)
    
    db_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        priority_score=priority_score,
        due_date=task.due_date,
        status=task.status,
        source=task.source,
        created_at=datetime.now().isoformat()
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Log the creation
    log = WorkLog(task_id=db_task.id, action="created", details=f"Task '{db_task.title}' created")
    db.add(log)
    db.commit()
    
    return db_task

@router.get("/{task_id}", response_model=TaskSchema)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a single task by ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskSchema)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    # Recalculate priority if priority or due_date changed
    if "priority" in update_data or "due_date" in update_data:
        task.priority_score = calculate_priority_score(
            TaskCreate(title=task.title, description=task.description, 
                      priority=task.priority, due_date=task.due_date,
                      status=task.status, source=task.source)
        )
    
    # If status changed to completed, set completed_at
    if task.status == "completed" and not task.completed_at:
        task.completed_at = datetime.now().isoformat()
        log = WorkLog(task_id=task.id, action="completed", details=f"Task '{task.title}' completed")
        db.add(log)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

@router.post("/{task_id}/complete", response_model=TaskSchema)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    """Mark a task as completed."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = "completed"
    task.completed_at = datetime.now().isoformat()
    
    log = WorkLog(task_id=task.id, action="completed", details=f"Task '{task.title}' completed")
    db.add(log)
    db.commit()
    db.refresh(task)
    return task