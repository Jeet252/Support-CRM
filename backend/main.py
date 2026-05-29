import os
import json
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from database import engine, Base, get_db, SessionLocal
import models, schemas, crud

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Customer Support CRM API",
    description="Backend API for managing support tickets, customer data, and notes.",
    version="1.0.0"
)


# CORS Configuration - Enable React frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins. Can be restricted to local ports.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Auto-Seeding from mock_data.json
@app.on_event("startup")
def seed_database():
    db = SessionLocal()
    try:
        # Only seed if no tickets exist in the database
        if db.query(models.Ticket).count() == 0:
            mock_data_path = os.path.join(os.path.dirname(__file__), "mock_data.json")
            if os.path.exists(mock_data_path):
                with open(mock_data_path, "r", encoding="utf-8") as f:
                    tickets = json.load(f)
                
                for idx, t_data in enumerate(tickets, 1):
                    t_id = f"TKT-{idx:03d}"
                    # Create ticket record
                    db_ticket = models.Ticket(
                        ticket_id=t_id,
                        customer_name=t_data["customer_name"],
                        customer_email=t_data["customer_email"],
                        subject=t_data["subject"],
                        description=t_data["description"],
                        status=t_data["status"]
                    )
                    db.add(db_ticket)
                    db.commit()
                    db.refresh(db_ticket)

                    # Add associated notes
                    for note_text in t_data.get("notes", []):
                        db_note = models.TicketNote(
                            ticket_id=t_id,
                            note_text=note_text
                        )
                        db.add(db_note)
                    db.commit()
                print("Database auto-seeded successfully from mock_data.json!")
            else:
                print("Warning: mock_data.json not found. Database is empty.")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

# Root Endpoint
@app.get("/")
def read_root():
    return {"message": "Customer Support CRM API is running successfully."}

# 1. Create a new support ticket
@app.post(
    "/api/tickets",
    response_model=schemas.TicketCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new ticket"
)
def create_ticket_endpoint(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    db_ticket = crud.create_ticket(db, ticket)
    return db_ticket

# 2. Get list of tickets (with search & status filters)
@app.get(
    "/api/tickets",
    response_model=List[schemas.TicketShortResponse],
    summary="List all tickets"
)
def list_tickets_endpoint(
    status: Optional[str] = Query(None, description="Filter by ticket status (Open, In Progress, Closed)"),
    search: Optional[str] = Query(None, description="Search term matching customer name, email, subject, or ID"),
    db: Session = Depends(get_db)
):
    if status and status not in ["Open", "In Progress", "Closed"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Must be one of: Open, In Progress, Closed"
        )
    return crud.get_tickets(db, status=status, search=search)

# 3. Get full ticket details by ID
@app.get(
    "/api/tickets/{ticket_id}",
    response_model=schemas.TicketDetailResponse,
    summary="Get ticket details by ID"
)
def get_ticket_endpoint(ticket_id: str, db: Session = Depends(get_db)):
    db_ticket = crud.get_ticket_by_id(db, ticket_id)
    if not db_ticket:
        raise HTTPException(
            status_code=404,
            detail=f"Ticket with ID {ticket_id} not found"
        )
    return db_ticket

# 4. Update status and/or add new note to a ticket
@app.put(
    "/api/tickets/{ticket_id}",
    response_model=schemas.TicketUpdateResponse,
    summary="Update ticket status and notes"
)
def update_ticket_endpoint(
    ticket_id: str,
    update_data: schemas.TicketUpdate,
    db: Session = Depends(get_db)
):
    db_ticket = crud.update_ticket(db, ticket_id, update_data)
    if not db_ticket:
        raise HTTPException(
            status_code=404,
            detail=f"Ticket with ID {ticket_id} not found"
        )
    return {
        "success": True,
        "updated_at": db_ticket.updated_at
    }

