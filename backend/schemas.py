from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Common properties
class TicketBase(BaseModel):
    customer_name: str = Field(..., min_length=1)
    customer_email: str = Field(..., min_length=3)
    subject: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

# Schema for creating a ticket (POST /api/tickets)
class TicketCreate(TicketBase):
    pass

# Response for created ticket
class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for updating status & notes (PUT /api/tickets/{ticket_id})
class TicketUpdate(BaseModel):
    status: str = Field(..., pattern="^(Open|In Progress|Closed)$")
    notes: Optional[str] = None

# Response for ticket updates
class TicketUpdateResponse(BaseModel):
    success: bool
    updated_at: datetime

# Schema for specific note details
class NoteResponse(BaseModel):
    id: int
    note_text: str
    created_at: datetime

    class Config:
        from_attributes = True

# Response for listing tickets (GET /api/tickets)
class TicketShortResponse(BaseModel):
    ticket_id: str
    customer_name: str
    subject: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Response for detailed view (GET /api/tickets/{ticket_id})
class TicketDetailResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    notes: List[NoteResponse]

    class Config:
        from_attributes = True
