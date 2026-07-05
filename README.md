# AccessAI

**Improve Access** — An AI-powered web application that helps students discover scholarships, jobs, internships, roadmaps, learning resources, and career opportunities instantly.

Built for the **Ctrl+V Hackathon** theme: *Improve Access*.

---

## Features

### Homepage
- Modern landing page with hero section, statistics, and feature cards
- Responsive navbar with login/signup CTAs
- Blue gradient design with glassmorphism and animations

### AI Assistant
- Chat interface powered by Google Gemini (`gemini-2.0-flash`)
- Structured responses: **Summary**, **Recommendations**, **Useful Links**, **Action Plan**
- 8 prompt templates: Scholarships, Internships, Career Advice, Learning Roadmap, Resume Tips, Interview Prep, Freelancing, Hackathons
- Suggested starter prompts for quick exploration

### Dashboard
- Sidebar navigation with dark mode toggle
- Responsive layout (mobile drawer sidebar)
- Real-time chat with loading states and error handling

### History
- Store previous chats automatically
- Search by title, message, or summary
- Delete individual history entries

### Settings
- Dark mode toggle (persisted to localStorage)
- User profile display
- Live API health check and Gemini key status

### Authentication
- Simple email/password login and signup
- JWT token-based sessions
- No OAuth required

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, TailwindCSS, Framer Motion, Axios |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| AI | Google Gemini API |
| Auth | JWT (PyJWT) + bcrypt password hashing |
| Storage | JSON file persistence (users, history) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Vite)                    │
│  Landing │ Login │ Signup │ Dashboard │ History │ Settings   │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (Axios)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Python)                   │
│  /chat  /history  /login  /signup  /health                 │
└──────────────┬─────────────────────────────┬────────────────┘
               │                             │
               ▼                             ▼
      ┌────────────────┐           ┌─────────────────┐
      │  Google Gemini │           │  JSON Storage   │
      │ (gemini-2.0-flash)        │ users + history │
      └────────────────┘           └─────────────────┘
```

### Request flow (chat)

1. User sends a message from the Dashboard
2. Frontend `POST /chat` with message and optional template key
3. Backend builds prompt via `prompt.py` and calls Gemini
4. Response markdown is parsed into structured fields via `formatter.py`
5. Entry is saved to `data/history.json`
6. Structured `ChatResponse` returned to the frontend

---

## Folder Structure

```
AccessAI/
├── README.md
├── PROJECT_SPEC.md
├── LICENSE
├── backend/
│   ├── .env.example          # Environment variable template
│   ├── requirements.txt      # Python dependencies
│   ├── data/                 # Runtime JSON storage (auto-created)
│   │   ├── history.json
│   │   └── users.json
│   └── app/
│       ├── main.py           # FastAPI entry point
│       ├── config.py         # Pydantic settings from .env
│       ├── api/
│       │   └── routes.py     # REST API endpoints
│       ├── models/
│       │   ├── request.py    # Incoming request schemas
│       │   └── response.py   # Outgoing response schemas
│       ├── services/
│       │   ├── gemini_service.py
│       │   ├── prompt.py
│       │   ├── formatter.py
│       │   ├── history_service.py
│       │   └── auth_service.py
│       └── utils/
│           └── logger.py
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── index.css
    ├── main.jsx
    ├── App.jsx
    ├── context/
    │   ├── AuthContext.jsx
    │   └── ThemeContext.jsx
    ├── layouts/
    │   └── AppLayout.jsx
    ├── pages/
    │   ├── Landing.jsx
    │   ├── Login.jsx
    │   ├── Signup.jsx
    │   ├── Dashboard.jsx
    │   ├── History.jsx
    │   ├── Settings.jsx
    │   └── NotFound.jsx
    └── services/
        └── api.js
```

---

## Installation

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API key** — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone <repository-url>
cd AccessAI
```

### 2. Backend setup

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

Edit `backend/.env` and set your Gemini API key:

```env
GEMINI_API_KEY=your-actual-gemini-api-key
```

Start the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App available at: [http://localhost:5173](http://localhost:5173)

### 4. Production build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Set `VITE_API_URL` in `frontend/.env.production` to your deployed backend URL.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health and Gemini config status |
| `POST` | `/chat` | Send message to AI assistant |
| `GET` | `/history` | List chat history (optional `?query=` search) |
| `DELETE` | `/history/{id}` | Delete a history entry |
| `POST` | `/login` | Authenticate user, returns JWT |
| `POST` | `/signup` | Register new user, returns JWT |

---

## Demo

### Quick start (no login required)

1. Open [http://localhost:5173](http://localhost:5173)
2. Click **Try Demo** on the landing page
3. Select a category chip (e.g. **Scholarships**)
4. Click a suggested prompt or type your own question
5. View the structured AI response

### Example prompts

```
I want scholarships in Germany for a Master's in Computer Science
I am a CS student in Pakistan — what opportunities should I explore?
Suggest an AI and machine learning roadmap for beginners
What skills should I learn to become a full-stack developer?
```

### With authentication

1. Click **Get Started** → create an account
2. Chat history is associated with your user ID
3. View past chats on the **History** page
4. Toggle dark mode in **Settings**

---

## Screenshots

> Add screenshots of the landing page, dashboard chat, and history page here after running the app.

| Page | Description |
|---|---|
| Landing | Hero, statistics, feature cards |
| Dashboard | AI chat with structured response |
| History | Searchable chat history list |
| Settings | Profile, dark mode, API status |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Gemini API key | *(required)* |
| `GEMINI_MODEL` | Model name | `gemini-2.0-flash` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed frontend URLs | `http://localhost:5173` |
| `JWT_SECRET` | JWT signing secret | *(change in production)* |
| `JWT_EXPIRE_MINUTES` | Token lifetime | `1440` |
| `APP_ENV` | `development` or `production` | `development` |
| `DEBUG` | Verbose logging | `true` |

### Frontend (`frontend/.env.production`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL for production builds |

---

## Future Improvements

- [ ] PostgreSQL database for users and history
- [ ] OAuth login (Google, GitHub)
- [ ] Streaming AI responses (SSE)
- [ ] Export chat history as PDF
- [ ] Bookmark / save favorite opportunities
- [ ] Multi-language support
- [ ] Admin dashboard with usage analytics
- [ ] Rate limiting per user
- [ ] Docker Compose for one-command deployment
- [ ] Unit and integration tests (pytest + Vitest)

---

## License

See [LICENSE](LICENSE) for details.

---

## Hackathon

**Theme:** Improve Access

AccessAI improves access to:
- Education
- Scholarships
- Internships
- Careers
- Learning
- AI guidance
