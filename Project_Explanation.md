# End-to-End Project Explanation: TaskFlow

## 1. High-Level Architecture
TaskFlow is a full-stack application built using the **MERN** stack (MongoDB, Express.js, React.js, Node.js). 
The application strictly separates the frontend (client) from the backend (server), communicating exclusively through a RESTful API.

### Key Components:
- **Frontend**: React.js (built with Vite), styled with Tailwind CSS. It handles all UI rendering, client-side routing, and local state management.
- **Backend**: Node.js and Express.js. It acts as the gatekeeper, processing requests, interacting with the database, and handling AI API calls.
- **Database**: MongoDB. A NoSQL database that stores our relational-like data (Users, Boards, Tasks).

---

## 2. Backend Architecture (MVC Pattern)
The backend is structured using the industry-standard **Model-View-Controller (MVC)** design pattern to ensure code is modular, readable, and scalable.

### A. Models (`/models`)
We use Mongoose to define the schema and relationships for our database:
- **User**: Stores the user's `name`, `email` (unique), and a hashed `password`.
- **Board**: Stores `title`, `description`, and an `owner` (Reference to a User ObjectId).
- **Task**: Stores `title`, `status` (To Do/In Progress/Done), `priority`, `dueDate`, `estimatedEffort`, the `board` it belongs to (Reference to Board ObjectId), and the `owner` (Reference to User ObjectId).

### B. Routes (`/routes`)
Routes act as traffic directors. When an HTTP request comes in (e.g., `GET /api/tasks`), the router forwards it to the appropriate Controller function. They also inject middleware (like the `auth` middleware) to protect the endpoints.

### C. Controllers (`/controllers`)
Controllers contain the actual **business logic**. 
- They receive the request data.
- They query or mutate the MongoDB database using the Mongoose Models.
- They enforce ownership (e.g., `if (task.owner !== req.user.id) return error`).
- They send the JSON response back to the frontend.

### D. Security & Authentication
- **Hashing**: When a user registers, their password is encrypted using `bcryptjs` before hitting the database.
- **JWT (JSON Web Tokens)**: Upon successful login, the server generates a signed JWT containing the user's ID. 
- **Middleware**: For any protected route (like creating a task), the `auth.js` middleware intercepts the request, verifies the JWT in the header, and attaches the user's ID to the request object (`req.user.id`).

---

## 3. Frontend Architecture
The frontend is a Single Page Application (SPA) built with React.

### A. Routing & Protection
We use `react-router-dom` to navigate between pages (`/login`, `/dashboard`, `/board/:id`). 
A top-level check in `App.jsx` ensures that if a user is not logged in (i.e., no user data in state), they are instantly redirected to the `/login` page, keeping private routes secure.

### B. State Management & API
- Local component state (`useState`, `useEffect`) manages form inputs, modal visibility, and fetched data arrays.
- All backend communication is done via an **Axios instance** (`api.js`). This instance is configured with an interceptor that automatically attaches the JWT from `localStorage` to the `Authorization` header of every outgoing request.

### C. UI & Styling
- **Tailwind CSS** handles all styling via utility classes.
- **Dark Mode**: A global toggle persists the user's preference to `localStorage` and toggles a `.dark` class on the root HTML element, activating Tailwind's `dark:` utility variants across the entire app.

---

## 4. The AI Feature Integration (Google Gemini)
TaskFlow includes a "Suggest Estimate" feature powered by a Large Language Model (LLM).

### The Flow:
1. **Trigger**: The user types a task title/description and clicks "Suggest Estimate" in the React frontend.
2. **Secure Request**: The frontend makes a POST request to `/api/tasks/suggest-estimate` with the title and description.
3. **Backend Prompt Engineering**: The `taskController` receives this request. It securely accesses the `GEMINI_API_KEY` from the server's `.env` file (preventing the key from being exposed to the browser). 
4. **LLM Call**: It constructs a rigid prompt instructing Gemini to return *only* a JSON object containing an estimated effort and a suggested due date.
5. **Parsing & Returning**: The backend awaits the LLM's response, parses the text into actual JSON, and returns it to the frontend.
6. **UI Update**: The frontend displays the suggestion. If the user accepts, the form's React state is updated with the new values.

---

## 5. Summary of a Data Flow (e.g., Creating a Task)
To put it all together, here is what happens when a user creates a task:

1. User clicks "Create Task" on the frontend.
2. React prevents default form submission and sends an Axios `POST` request to `/api/tasks` with the task data and the JWT token in the header.
3. The Express backend receives the request. The `auth` middleware verifies the token and identifies the user.
4. The router forwards the request to `createTask` in the `taskController`.
5. The controller verifies the user actually owns the Board they are trying to add a task to.
6. A new `Task` document is created and saved to MongoDB.
7. MongoDB returns the newly created task object.
8. The backend sends this task object back as a `200 OK` JSON response.
9. The frontend resolves the promise, closes the modal, and triggers a re-fetch of the tasks to update the UI instantly.
