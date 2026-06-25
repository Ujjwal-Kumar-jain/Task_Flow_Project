# TaskFlow - A Smart Task & Project Manager

TaskFlow is a lightweight, full-stack task and project management application inspired by Trello and Asana. It allows users to create project boards, organize tasks across status columns (To Do, In Progress, Done), set priorities, and track progress. 

What sets TaskFlow apart is its **Smart AI Assist** feature: powered by Google's Gemini LLM, it can instantly analyze a task's title and description to suggest an effort estimate and a reasonable due date, helping users plan their work more efficiently.

---

## 📸 Screenshots
*(Add screenshots of your application here before submitting)*

- **Login / Register Page**: `[Screenshot Placeholder]`
- **Dashboard (Boards View)**: `[Screenshot Placeholder]`
- **Board View (Kanban)**: `[Screenshot Placeholder]`
- **Mobile View**: `[Screenshot Placeholder]`

---

## 🛠️ Tech Stack & Libraries

### Frontend
- **React.js (v19)** - UI Library
- **Vite** - Build tool and dev server
- **Tailwind CSS (v4)** - Utility-first styling and Dark Mode support
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

### Backend
- **Node.js & Express.js** - RESTful API framework
- **MongoDB (Mongoose)** - NoSQL Database and ODM
- **JSON Web Tokens (JWT)** - Secure authentication
- **Bcrypt.js** - Password hashing
- **@google/genai** - Google Gemini SDK for AI integration

---

## 🤖 AI Feature Integration

### Which LLM API was chosen and why?
I chose the **Google Gemini API** (specifically the `gemini-2.5-flash` model). 
- **Why:** Gemini provides a very generous free tier which is perfect for development and portfolio projects. The `flash` model is incredibly fast, ensuring the user doesn't wait long for task estimates. It is also highly reliable for structured JSON generation.

### How it works:
1. When a user clicks the **"AI Suggest Estimate"** button on the frontend, a POST request is sent to the `/api/tasks/suggest-estimate` backend endpoint.
2. The backend securely constructs a prompt using the task's title and description, explicitly asking the LLM to return only a formatted JSON object containing an estimated effort and a suggested due date.
3. The LLM API key (`GEMINI_API_KEY`) is securely stored in the backend `.env` file and **never reaches the browser**.
4. The backend parses the LLM's response and sends the clean JSON back to the frontend.
5. The frontend displays the suggestion to the user in a non-intrusive alert box. The user can click "Accept" to auto-fill their form fields, or "Ignore" to dismiss it.
6. **Graceful Fallback:** If the API key is missing or the AI service is down, the backend returns a clean error message, and the frontend disables the AI button, ensuring the core CRUD features of the app remain fully functional.

---

## 🚀 Local Setup & Installation

Follow these steps to run the application locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally or a MongoDB Atlas URI)
- A free Google Gemini API Key

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd Mandul
\`\`\`

### 2. Backend Setup
\`\`\`bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env
\`\`\`

**Configure your backend `.env` file:**
\`\`\`env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow  # Or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key_here
\`\`\`

**Start the backend server:**
\`\`\`bash
# Run in dev mode (uses nodemon)
npm run dev
\`\`\`
The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal window/tab.
\`\`\`bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
\`\`\`
The frontend will run on `http://localhost:5173`.

---

## 📁 Project Structure

The project follows a clean MVC (Model-View-Controller) architecture on the backend.

\`\`\`text
Mandul/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic for routes
│   ├── middleware/      # JWT auth middleware
│   ├── models/          # Mongoose schemas (User, Board, Task)
│   ├── routes/          # API route definitions
│   ├── .env.example     # Environment variables template
│   └── server.js        # Express application entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components (Navbar, etc.)
    │   ├── pages/       # Route components (Dashboard, BoardView, Login, etc.)
    │   ├── api.js       # Axios instance setup
    │   └── App.jsx      # Main application router
    └── tailwind.config  # Tailwind CSS configuration
\`\`\`

---

## 🔒 Security & Data Modeling
- **Authentication**: Passwords are one-way hashed using `bcryptjs` before being stored in the database.
- **Stateless Sessions**: Authentication is handled via JWTs. The token is sent in the `Authorization` header of every protected request.
- **Ownership Enforcement**: The backend strictly validates that users can only view, edit, or delete Boards and Tasks that belong to their specific `ObjectId`.
- **Relational Data**: Tasks are explicitly linked to a Board (`board` ref) and a User (`owner` ref) using MongoDB `ObjectId` references.

---

## 🔗 API Documentation

### Auth Endpoints
| Method | Path | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Login and receive a JWT token |
| `GET` | `/api/auth/me` | Fetch the currently authenticated user's details |

### Board Endpoints (Requires Auth)
| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/boards` | Get all boards belonging to the logged-in user |
| `POST` | `/api/boards` | Create a new board |
| `PUT` | `/api/boards/:id` | Update a board's title/description |
| `DELETE` | `/api/boards/:id` | Delete a board and all its associated tasks |

### Task Endpoints (Requires Auth)
| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks for the logged-in user (across all boards) |
| `POST` | `/api/tasks` | Create a new task within a specific board |
| `PUT` | `/api/tasks/:id` | Update a task (e.g., move it to a different status column) |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `POST` | `/api/tasks/suggest-estimate` | **[AI Feature]** Sends task title/description to Gemini LLM for effort estimation |

---

## 🌐 Live Demo & Test Credentials

- **Frontend URL (Vercel)**: `[Insert Vercel URL here]`
- **Backend URL (Render)**: `[Insert Render URL here]`

**Test Account Credentials:**
Feel free to create your own account, or use these test credentials:
- **Email:** `testuser@example.com`
- **Password:** `password123`

---

## ⚠️ Known Issues / Limitations & Future Improvements

### Limitations:
- **Render Cold Starts:** The backend is hosted on Render's free tier, which spins down after inactivity. The very first request (like logging in) may take 30-50 seconds to wake up the server. 
- **AI Latency:** The AI suggestion relies on the Gemini API. During peak times, the response might take a few seconds to generate.

### What I would improve with more time:
1. **Drag-and-Drop functionality** for moving tasks between columns natively instead of relying strictly on edit modals.
2. **Global Task Search** and advanced filtering across all boards.
3. **Collaboration Features** to share a board with other registered users (currently, all boards are strictly private to the creator).
4. **Comprehensive Test Suite** including unit tests with Jest and E2E testing with Cypress.
