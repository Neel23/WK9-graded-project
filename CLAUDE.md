# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DevAnswers** is a full-stack Q&A web application (Stack Overflow-style) with two separate apps:
- `devanswers-backend/` — Node.js/Express REST API with MongoDB
- `devanswers-frontend/` — React SPA with Redux Toolkit and Vite

## Commands

### Backend (`cd devanswers-backend`)
```bash
npm run dev        # Start dev server with nodemon (auto-restart)
npm start          # Start production server
npm test           # Run all tests (Vitest + MongoDB Memory Server)
npm run populate   # Seed the database with sample data
```

### Frontend (`cd devanswers-frontend`)
```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run lint       # Run ESLint
npm test           # Run Vitest tests
```

## Environment Setup

Backend requires a `.env` file (copy from `.env.example`):
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sampleDB
JWT_SECRET=please_change_this_to_a_secure_value
JWT_EXPIRATION=7d
```

Frontend API calls target `http://localhost:3000/api` (configured in `src/axiosInstance.js`).

## Architecture

### Backend

Entry point: `main.js` → `server.js` → `src/app.js`

Layered architecture: **Routes → Controllers → Services → Mongoose Models**

- `src/routes/` — Express routers mounted at `/api/{auth,questions,answers,tags}`
- `src/controllers/` — Request/response handling, delegates to services
- `src/services/` — Business logic (`userService`, `questionService`, `answerService`, `voteService`, `tagService`)
- `src/models/` — Mongoose schemas: User, Question, Answer, Tag
- `src/middleware/authHandler.js` — JWT verification middleware
- `src/middleware/errorHandler.js` — Global error handler
- `src/utils/createAppError.js` — Custom error factory

### Frontend

Entry point: `src/main.jsx` → wraps `<App />` with Redux `<Provider>`

- `src/App.jsx` — React Router route definitions
- `src/store.js` — Redux store with slices: `userSlice`, `questionSlice`, `themeSlice`
- `src/pages/` — Route-level components (Home, QuestionDetail, PostQuestion, Login, Register, Profile, Tags)
- `src/components/` — Reusable UI components (VoteButtons, QuestionCard, AnswerForm, Navbar, etc.)
- `src/layouts/` — Page layout wrappers (BaseLayout, SideBarLayout, RightSidebarLayout)
- `src/axiosInstance.js` — Axios client pre-configured with base URL and auth token interceptor
- `src/config/config.js` — Centralized API endpoint constants (AUTH_API, QUESTION_API, etc.)

### Data Models

| Model    | Key fields |
|----------|-----------|
| User     | name, email (unique), password (hashed), profileImage, isAdmin |
| Question | title, description, tags[], author, upvotes[], downvotes[], voteCount, views |
| Answer   | answerText, questionId, author, upvotes[], downvotes[], voteCount |
| Tag      | name (unique) |

### Testing

**Backend**: Vitest + SuperTest + `mongodb-memory-server` for an in-memory DB. Tests live in `tests/`. Allow ~60s timeout due to MongoDB Memory Server startup.

**Frontend**: Vitest + React Testing Library + MSW (Mock Service Worker). Mock handlers are in `tests/mocks/handlers.js` and `tests/mocks/server.js`.
