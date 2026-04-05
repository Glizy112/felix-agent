from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db, CalendarEvent
from schemas import CalendarEvent as CalendarEventSchema
from datetime import datetime, timedelta
import os

router = APIRouter()

# Google Calendar MCP configuration
GOOGLE_CALENDAR_MCP_URL = os.getenv("GOOGLE_CALENDAR_MCP_URL", "http://localhost:3001")

@router.get("/events")
def get_calendar_events(db: Session = Depends(get_db)):
    """
    Get calendar events from Google Calendar via MCP.
    For prototype: returns cached events or sample data for demo.
    """
    # Try to fetch from MCP server first
    try:
        import requests
        response = requests.get(f"{GOOGLE_CALENDAR_MCP_URL}/events", timeout=5)
        if response.status_code == 200:
            events_data = response.json()
            # Cache events in DB
            for event in events_data:
                existing = db.query(CalendarEvent).filter(CalendarEvent.event_id == event.get("id")).first()
                if not existing:
                    db_event = CalendarEvent(
                        event_id=event.get("id", ""),
                        title=event.get("summary", "Untitled"),
                        start_time=event.get("start", {}).get("dateTime", event.get("start", {}).get("date", "")),
                        end_time=event.get("end", {}).get("dateTime", event.get("end", {}).get("date", "")),
                        description=event.get("description", ""),
                        location=event.get("location", ""),
                        synced_at=datetime.now().isoformat()
                    )
                    db.add(db_event)
            db.commit()
            return events_data
    except Exception as e:
        print(f"MCP fetch error: {e}")
        pass
    
    # Return cached events from DB
    cached_events = db.query(CalendarEvent).order_by(CalendarEvent.start_time.asc()).all()
    if cached_events:
        return [{
            "id": e.event_id,
            "title": e.title,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "description": e.description,
            "location": e.location
        } for e in cached_events]
    
    # Return sample demo data if no real events
    today = datetime.now()
    sample_events = [
        {
            "id": "demo_1",
            "title": "Team Standup",
            "start_time": today.replace(hour=10, minute=0).isoformat(),
            "end_time": today.replace(hour=10, minute=30).isoformat(),
            "description": "Daily team sync meeting",
            "location": "Google Meet"
        },
        {
            "id": "demo_2",
            "title": "Project Review",
            "start_time": today.replace(hour=14, minute=0).isoformat(),
            "end_time": today.replace(hour=15, minute=0).isoformat(),
            "description": "Review sprint progress",
            "location": "Conference Room A"
        },
        {
            "id": "demo_3",
            "title": "Client Call",
            "start_time": today.replace(hour=16, minute=0).isoformat(),
            "end_time": today.replace(hour=16, minute=45).isoformat(),
            "description": "Discuss project requirements",
            "location": "Phone"
        }
    ]
    return sample_events

@router.get("/today")
def get_todays_events(db: Session = Depends(get_db)):
    """Get only today's calendar events."""
    all_events = get_calendar_events(db)
    today = datetime.now().date().isoformat()
    today_events = [e for e in all_events if e.get("start_time", "").startswith(today)]
    return today_events

@router.post("/sync")
def sync_calendar(db: Session = Depends(get_db)):
    """Force sync calendar events from Google Calendar MCP."""
    # Clear old cache
    db.query(CalendarEvent).delete()
    db.commit()
    
    # Fetch fresh events
    events = get_calendar_events(db)
    return {"message": "Calendar synced", "events_count": len(events)}