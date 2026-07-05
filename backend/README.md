# AccessAI Backend

FastAPI REST API for the AccessAI career and education assistant.

---

## Quick Start

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set `GEMINI_API_KEY`:

```env
GEMINI_API_KEY=your-actual-gemini-api-key
```

Start the server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: [http://localhost:8000](http://localhost:8000)
- Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health and Gemini config status |
| `POST` | `/chat` | AI chat — returns structured response |
| `GET` | `/history` | List chat history (`?query=`, `?user_id=`) |
| `DELETE` | `/history/{id}` | Delete a history entry |
| `POST` | `/login` | Authenticate user, returns JWT |
| `POST` | `/signup` | Register user, returns JWT |

---

## Project Structure

```
app/
├── main.py              # FastAPI app, CORS, error handlers
├── config.py            # Environment settings (Pydantic)
├── api/routes.py        # Route handlers
├── models/
│   ├── request.py       # ChatRequest, LoginRequest, SignupRequest
│   └── response.py      # ChatResponse, AuthResponse, ErrorResponse
├── services/
│   ├── gemini_service.py   # Google Gemini chat completions
│   ├── prompt.py           # System prompt and templates
│   ├── formatter.py        # Markdown → structured fields
│   ├── history_service.py  # JSON file history storage
│   └── auth_service.py     # JWT auth and user storage
└── utils/logger.py      # Logging configuration
```

---

## Environment Variables

See `.env.example` for all options. Required:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Gemini API key (required for `/chat`) |

---

## Data Storage

User accounts and chat history are stored in JSON files under `data/`:

```
data/
├── users.json      # Registered users (bcrypt hashed passwords)
└── history.json    # Chat history entries
```

This directory is auto-created on first run and is gitignored.

---

## Chat Response Format

`POST /chat` returns structured JSON:

```json
{
  "id": "uuid",
  "summary": "Brief overview...",
  "recommendations": ["...", "..."],
  "useful_links": [{ "title": "...", "url": "...", "description": "..." }],
  "action_plan": ["Step 1", "Step 2"],
  "markdown": "Full markdown response...",
  "created_at": "2026-07-04T12:00:00+00:00"
}
```

---

## Error Responses

All errors use a consistent envelope:

```json
{
  "success": false,
  "error": "validation_error",
  "message": "Human-readable description",
  "details": [{ "field": "email", "message": "..." }]
}
```

---

## Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload

# Run directly
python -m app.main

# Health check
curl http://localhost:8000/health
```

---

## Production Notes

- Set `APP_ENV=production` and `DEBUG=false`
- Change `JWT_SECRET` to a long random string
- Use a proper database (PostgreSQL) instead of JSON files for scale
- Configure `CORS_ORIGINS` to your frontend domain
