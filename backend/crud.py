from sqlalchemy.orm import Session
from sqlalchemy import or_
import datetime
import models, schemas

def get_next_ticket_id(db: Session) -> str:
    """
    Finds the latest ticket and increments the numeric suffix by 1.
    e.g., TKT-001 -> TKT-002.
    """
    # Fetch tickets ordered by id descending to find the last one created
    last_ticket = db.query(models.Ticket).order_by(models.Ticket.id.desc()).first()
    if last_ticket:
        try:
            # Extract number from format "TKT-XXX"
            parts = last_ticket.ticket_id.split("-")
            if len(parts) == 2:
                last_num = int(parts[1])
                next_num = last_num + 1
            else:
                next_num = 1
        except (ValueError, IndexError):
            next_num = 1
    else:
        next_num = 1
    
    return f"TKT-{next_num:03d}"

def create_ticket(db: Session, ticket: schemas.TicketCreate) -> models.Ticket:
    """
    Creates a new support ticket and adds a system log to the notes table.
    """
    ticket_id = get_next_ticket_id(db)
    
    db_ticket = models.Ticket(
        ticket_id=ticket_id,
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status="Open"
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    # Automatically add an initial creation note
    initial_note = models.TicketNote(
        ticket_id=ticket_id,
        note_text="System: Support ticket submitted by customer."
    )
    db.add(initial_note)
    db.commit()
    db.refresh(db_ticket)
    
    return db_ticket

def get_tickets(db: Session, status: str = None, search: str = None):
    """
    Retrieves tickets, optionally filtering by status and searching across key columns.
    """
    query = db.query(models.Ticket)
    
    # Status filtering (Open, In Progress, Closed)
    if status:
        query = query.filter(models.Ticket.status == status)
        
    # Search query applied to customer_name, customer_email, subject, or ticket_id
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Ticket.customer_name.ilike(search_filter),
                models.Ticket.customer_email.ilike(search_filter),
                models.Ticket.subject.ilike(search_filter),
                models.Ticket.ticket_id.ilike(search_filter)
            )
        )
        
    # Order by creation date descending so new tickets appear first
    return query.order_by(models.Ticket.created_at.desc()).all()

def get_ticket_by_id(db: Session, ticket_id: str) -> models.Ticket:
    """
    Retrieves full details of a specific ticket using its unique ticket_id.
    """
    return db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()

def update_ticket(db: Session, ticket_id: str, update_data: schemas.TicketUpdate) -> models.Ticket:
    """
    Updates the ticket status, sets the updated_at timestamp, and appends a new note.
    """
    db_ticket = get_ticket_by_id(db, ticket_id)
    if not db_ticket:
        return None

    # Track if anything changed to update the timestamp
    changed = False

    if db_ticket.status != update_data.status:
        db_ticket.status = update_data.status
        changed = True

    # If there is a new note to add, insert it into the database linked to this ticket
    if update_data.notes and update_data.notes.strip():
        new_note = models.TicketNote(
            ticket_id=ticket_id,
            note_text=update_data.notes.strip()
        )
        db.add(new_note)
        changed = True

    if changed:
        db_ticket.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(db_ticket)

    return db_ticket
