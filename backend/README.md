# SupportDesk CRM — Backend API Server

This is the FastAPI backend API server for SupportDesk CRM.

For complete documentation including architecture details, REST API descriptions, database schemas, and full setup/run instructions, please refer to the main **[Root README.md](../README.md)**.

## Developer Quick Start

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS / Linux:
   source venv/bin/activate
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8080
   ```
4. Confirm the server is running by visiting: `http://localhost:8080/`
