from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import tasks, calendar, agent, analytics

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Felix - Personal Productivity Agent", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])
app.include_router(agent.router, prefix="/api/agent", tags=["agent"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Felix API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)