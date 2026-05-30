# 📊 SupportDesk CRM — Customer Support Portal

SupportDesk CRM is a modern, high-performance, full-stack web application designed for support agents to manage, track, and resolve customer inquiries. It features an interactive, single-page dashboard with a fast API-driven architecture, a SQLite database, and real-time status tracking.

Built with a sleek, premium, split-screen Master-Detail layout, SupportDesk CRM provides support agents with instant access to ticket details, live stats metrics, query searching, and a complete historical timeline of notes and system actions.

---

## 🚀 Key Features

*   **Real-time Ticket Metrics Panel**: Instant, live overview cards representing total, open, in-progress, and closed ticket counts.
*   **Split-Screen Master-Detail Interface**: Highly responsive panel layout that lets agents scan the ticket queue on the left while updating ticket history and timeline notes on the right without switching pages.
*   **Smart Search & Filtering**: Debounced search inputs filter tickets instantly by ID, customer name, email, or subject. Quick-action status filter tabs restrict view to `Open`, `In Progress`, or `Closed` tickets.
*   **Interactive Conversation Timeline**: Every ticket tracks a full list of chronological logs, including automated system submittal stamps and custom internal agent notes.
*   **Ticket Submission Form Overlay**: A beautiful sliding modal that enables quick ticket creation with client validation.
*   **Auto-dismissing Toast Notifications**: Visual status banners confirming ticket creation, updates, and server connections.

---

## 🛠️ Technology Stack

### Backend
*   **FastAPI** (Python): High-performance, modern, and rapid web framework for building APIs.
*   **Uvicorn**: Lightning-fast ASGI web server implementation.
*   **SQLAlchemy 2.0**: Next-generation Python SQL Toolkit and Object-Relational Mapper (ORM).
*   **Pydantic v2**: Precise data validation and schema representation.
*   **SQLite**: Self-contained, single-file, lightweight relational database.

### Frontend
*   **React 19**: Modern component lifecycle structure with performance-optimized state management.
*   **Vite**: Extremely fast bundler and frontend development server.
*   **Tailwind CSS v4**: Sleek, modern utility-first CSS styles for rapid layout prototyping.
*   **Lucide React**: Clean, lightweight, customizable vector icon library.
*   **React Context API**: Clean and lightweight state provider that eliminates prop-drilling.

---

## 📂 Project Structure

```text
Support CRM/
├── backend/
│   ├── main.py              # FastAPI application setup and API endpoints
│   ├── database.py          # SQLAlchemy SQLite connection and session management
│   ├── models.py            # SQLAlchemy database tables (Tickets & Notes)
│   ├── schemas.py           # Pydantic data schemas for requests and responses
│   ├── crud.py              # Create, Read, Update, and Delete database operations
│   ├── requirements.txt     # Python backend dependencies
│   ├── test_api.py          # Standalone automated REST API test script
│   └── support_crm.db       # Local SQLite database file (auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Navbar, StatsRow, TicketList, etc.)
│   │   ├── context/         # React Context API global state provider
│   │   ├── App.jsx          # Main application entry point
│   │   ├── main.jsx         # React bootstrapping file
│   │   └── index.css        # Global CSS stylesheet & Tailwind configuration
│   ├── index.html           # Document template wrapper
│   ├── package.json         # Node.js dependencies and run scripts
│   ├── vite.config.js       # Vite bundler configurations
│   ├── tailwind.config.js   # Tailwind style extensions
│   └── postcss.config.js    # PostCSS processor configurations
│
└── README.md                # Project documentation (this file)
```

---

## 🗄️ Database Schema & Models

The SQLite database consists of two tables linked via a **One-to-Many** relationship: `tickets` and `ticket_notes`.

### 1. `tickets` Table
Holds the primary support ticket information submitted by customers.

| Column Name | Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key (Auto-Increment) | Internal database identifier. |
| `ticket_id` | String | Unique, Indexed, Not Null | Public facing custom ID format (e.g., `TKT-001`, `TKT-002`). |
| `customer_name` | String | Not Null | Name of the customer who submitted the ticket. |
| `customer_email`| String | Not Null | Email address of the customer. |
| `subject` | String | Not Null | Short summary or topic of the issue. |
| `description` | Text | Not Null | Detailed description of the support request. |
| `status` | String | Default: `"Open"` | Current workflow stage (`Open`, `In Progress`, `Closed`). |
| `created_at` | DateTime | Default: `UTC Now` | Timestamp when the ticket was generated. |
| `updated_at` | DateTime | Default: `UTC Now`, Auto-update | Timestamp when the ticket was last modified. |

### 2. `ticket_notes` Table
Appends internal notes, status audits, and messaging threads linked to a ticket.

| Column Name | Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key (Auto-Increment) | Internal note identifier. |
| `ticket_id` | String | Foreign Key -> `tickets.ticket_id` | Association code referencing the parent ticket. |
| `note_text` | Text | Not Null | The body of the note/comment. |
| `created_at` | DateTime | Default: `UTC Now` | Timestamp when the comment was added. |

---

## 📡 REST API Documentation

The backend exposes a highly robust, fully typed JSON REST API documented below:

### 1. Root Handshake
*   **Method / Route**: `GET /`
*   **Summary**: Confirm server status.
*   **Response (200 OK)**:
    ```json
    {
      "message": "Customer Support CRM API is running successfully."
    }
    ```

### 2. Create a Ticket
*   **Method / Route**: `POST /api/tickets`
*   **Summary**: Submits a new customer inquiry, automatically formats a unique ID (`TKT-XXX`), and logs a system entry note.
*   **Request Body (`schemas.TicketCreate`)**:
    ```json
    {
      "customer_name": "Tony Stark",
      "customer_email": "tony@starkindustries.com",
      "subject": "Arc Reactor Power Ripple",
      "description": "My home grid is experiencing a 3% voltage ripple in the secondary output phase."
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "ticket_id": "TKT-001",
      "created_at": "2026-05-30T10:00:00Z"
    }
    ```

### 3. List All Tickets
*   **Method / Route**: `GET /api/tickets`
*   **Summary**: Retrieves a list of all tickets, ordered newest first. Supports optional querying and status filtering.
*   **Query Parameters (Optional)**:
    *   `status`: Filter by state (`Open`, `In Progress`, `Closed`).
    *   `search`: Search string matched against ticket ID, name, email, or subject.
*   **Response (200 OK)**:
    ```json
    [
      {
        "ticket_id": "TKT-001",
        "customer_name": "Tony Stark",
        "subject": "Arc Reactor Power Ripple",
        "status": "Open",
        "created_at": "2026-05-30T10:00:00Z"
      }
    ]
    ```

### 4. Get Ticket Details
*   **Method / Route**: `GET /api/tickets/{ticket_id}`
*   **Summary**: Fetches comprehensive ticket details including the complete chronological list of timeline notes.
*   **Response (200 OK)**:
    ```json
    {
      "ticket_id": "TKT-001",
      "customer_name": "Tony Stark",
      "customer_email": "tony@starkindustries.com",
      "subject": "Arc Reactor Power Ripple",
      "description": "My home grid is experiencing a 3% voltage ripple in the secondary output phase.",
      "status": "Open",
      "created_at": "2026-05-30T10:00:00Z",
      "updated_at": "2026-05-30T10:00:00Z",
      "notes": [
        {
          "id": 1,
          "note_text": "System: Support ticket submitted by customer.",
          "created_at": "2026-05-30T10:00:00Z"
        }
      ]
    }
    ```

### 5. Update Ticket Status & Add Notes
*   **Method / Route**: `PUT /api/tickets/{ticket_id}`
*   **Summary**: Modifies the workflow state of a ticket and/or appends a new comment to the timeline.
*   **Request Body (`schemas.TicketUpdate`)**:
    ```json
    {
      "status": "In Progress",
      "notes": "Assigned to Engineering. JARVIS is matching telemetry ripple files."
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "updated_at": "2026-05-30T10:15:00Z"
    }
    ```

---

## ⚙️ Setup & Installation Instructions

Follow these step-by-step instructions to run the application locally on your computer.

### Prerequisites
Make sure you have the following installed on your machine:
*   [Python 3.8+](https://www.python.org/)
*   [Node.js 18+](https://nodejs.org/)

---

### Step 1: Run the Backend API Server

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment**:
    *   **Windows**:
        ```powershell
        python -m venv venv
        venv\Scripts\activate
        ```
    *   **macOS / Linux**:
        ```bash
        python -m venv venv
        source venv/bin/activate
        ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Start the FastAPI application**:
    Run Uvicorn specifying port `8080` (so the React app's API default base url points directly to it without configuration):
    ```bash
    uvicorn main:app --reload --port 8080
    ```
    *   *Note: If you run the backend on port `8000`, configure your frontend environment variables to point to it.*
    *   The backend will generate the SQLite database file `support_crm.db` inside the `/backend` folder automatically on startup.

---

### Step 2: Test the REST API (Optional)

We have provided a standalone verification script to test all the API operations.

1.  Open a new terminal while the backend is running.
2.  Navigate to the backend directory and run:
    ```bash
    python test_api.py
    ```
    *(Note: Ensure the backend is running on `http://localhost:8000` to execute the script directly, or adjust the `API_BASE` inside `test_api.py` if port `8080` is used).*

---

### Step 3: Run the React + Vite Frontend App

1.  **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```

2.  **Install the Node packages**:
    ```bash
    npm install
    ```

3.  **Launch the frontend local dev server**:
    ```bash
    npm run dev
    ```

4.  **Access the application**:
    Open your browser and navigate to the address displayed in your terminal (typically **`http://localhost:5173/`**).

---

## 🎨 UI Architecture Details

The React client relies on a clean, professional, component-driven structure:

1.  **`TicketContext`**: Centralized state manager handling data fetching hooks, filters, stats counting, and submission callbacks.
2.  **`StatsRow`**: A horizontal layout showcasing metrics cards with appropriate colors representing `Total`, `Open`, `In Progress`, and `Closed` tickets.
3.  **`TicketList`**: A comprehensive sidebar listing tickets, search/filter bars, and styling indicating active items.
4.  **`TicketDetail`**: A detailed window mapping fields, updated timestamps, scrollable conversation logs, and input widgets to change statuses and append notes.
5.  **`CreateTicketModal`**: A fully validation-safe overlay allowing support teams or users to file standard inquiries.
6.  **`ToastNotification`**: A slide-in visual confirmation banner.
