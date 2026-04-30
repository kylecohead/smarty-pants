# Smartie-Pants

A real-time, multiplayer trivia tournament web application built as a group project for Computer Science 343 at Stellenbosch University. The application supports authenticated users, live gameplay with synchronised countdowns, a question bank populated via web scraping, and an admin interface for content and user management.

> This was a collaborative group project. Credit for the code and design belongs to all five team members.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite 7+), Tailwind CSS |
| Backend | Node.js, Express (REST API) |
| Real-time | Socket.IO |
| Database | PostgreSQL via Prisma ORM (3NF) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Containerisation | Docker, Docker Compose |
| Reverse Proxy | Nginx |

---

## Features

- User registration, login, and profile management (avatar, username, password)
- Match creation and lobby system with host controls and player invitations
- Six question categories: General Knowledge, Science, Entertainment, Geography, Sports, and History
- Four rounds per game with up to seven questions per round
- Synchronized 20-second countdown per question with live score updates
- Tie-breaking by total correct answers, then average response time
- Leaderboard with daily/weekly views and filtering
- Admin interface for question bank management, user management, and category control
- Questions sourced automatically via a custom web scraper (Open Trivia Database API)
- Match history and per-user statistics on profile pages
- Responsive design across screen sizes

---

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Running the Application

All commands are run from the project root via `make`.

| Command | Description |
|---|---|
| `make run` | Start the application with no changes |
| `make reset` | Full reset — applies database migrations and re-seeds |
| `make build` | Rebuild the entire Docker image |
| `make backend` | Rebuild the backend service only |
| `make frontend` | Rebuild the frontend service only |
| `make seed` | Drop, recreate, and re-seed the database |
| `make logs` | Tail logs (useful if startup fails) |
| `make stop` | Stop all Docker containers |
| `make db` | Open a Postgres shell |
| `make nuke` | Remove all Docker images and re-download everything from scratch |

Once running, the frontend is available at:
http://localhost:5173/

### Testing Real-time Functionality

After Docker is running, open two separate terminals and run:

```bash
make test-socket USER=Alice
make test-socket USER=Bob
```

This simulates two concurrent socket connections for testing live gameplay updates.

---

## Demo Accounts

The following seeded accounts are available after running `make reset` or `make seed`:

| Name | Email | Password | Role |
|---|---|---|---|
| Nina | nina@example.com | 1234 | User |
| Wikus | wikus@example.com | 1234 | User |
| Amy | amy@example.com | 1234 | User |
| Conrad | conrad@example.com | 1234 | User |
| Kyle | kyle@example.com | 1234 | User |
| Admin | admin@example.com | 1234 | Admin |

---

## Project Structure
Smartie-Pants/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── scripts/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── index.js
│   │   └── socket.js
│   ├── uploads/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── modals/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── Makefile
├── nginx.conf
└── OpenTDB_API.postman_collection.json

---

## API Documentation

This project consumes the [Open Trivia Database (OpenTDB)](https://opentdb.com/) API to populate the question bank via an automated scraping script. No questions are entered manually.

A Postman collection documenting the API integration is included in the repository:
OpenTDB_API.postman_collection.json
Import this file into Postman to inspect and test the exact requests used by the application.

---

## Production Deployment

The production build uses a separate Compose file:

```bash
docker compose -f docker-compose.prod.yml exec frontend npm run build
```

Or via the Makefile shorthand:

```bash
make prod
```

---

## Notes

- Avatar images are stored in the file system, not the database. Only the file path reference is persisted.
- All database tables are normalised to Third Normal Form (3NF).
- Passwords are hashed and salted using bcrypt with a minimum cost factor of 12.
- JWT access and refresh tokens are used for authentication, with token expiry handled on the client and server.
