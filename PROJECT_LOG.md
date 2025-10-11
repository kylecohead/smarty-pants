# 📘 Project 2 – Development Log

**Team:** Multi-player Trivia Tournament  
**Course:** Computer Science 343  
**Date Started:** 2025-09-19  
**Repository Branches:** `main`, `dev`, feature branches (list)

---

## 🧑‍💻 Team Members & Roles

| Name                 | Student Number   | Primary Role       | Primary Responsibilities                                  |
| -------------------- | ---------------- | ------------------ | --------------------------------------------------------- |
| [Your Name]          | [Your Student #] | Frontend Developer | React components, styling, UI improvements, profile pages |
| **Nina Swart**       | **26970341**     | Frontend Developer | Styling, landing page, create & join game frontend        |
| [Teammate 2]         | [Student #]      | Database Engineer  | PostgreSQL schema, normalization (3NF), Prisma setup      |
| **Kyle Cohead**      | **25964917**     | Real-time Systems  | Socket.IO setup, live gameplay logic                      |
| **Wikus van Biljon** | **26927543**     | authentication     | Login and signup, Docker, Socket.IO, version control      |

---

## 🗓️ Daily Work Log

| Date           | Member | Branch                         | Description of Work Done                                                               | Commit / Merge Status |
| -------------- | ------ | ------------------------------ | -------------------------------------------------------------------------------------- | --------------------- | --- |
| **2025-09-19** | Nina   | `main`                         | Initialized React project with Vite and Tailwind                                       | ✅ Merged             |
| **2025-09-19** | Nina   | `main`                         | Initialized all pages & routing to pages                                               | ✅ Merged             |
| **2025-09-19** | Wikus  | `dev`                          | Set up Express backend, Docker Compose, and initial API routes                         | ✅ Merged             |
| **2025-09-20** | Nina   | `feature/Nina-createAndJoin`   | Created Join Game Lobby static layout and navigation to `JoinGame.jsx`                 | ✅ Merged             |
| **2025-09-20** | Kyle   | `feature/kyle-play-game`       | Implemented single player game play logic                                              | ✅ Merged             |
| **2025-09-20** | Wikus  | `dev`                          | Added initial Prisma schema and basic user authentication                              | ✅ Merged             |
| **2025-09-23** | Wikus  | `backend-setup`                | Integrated Prisma ORM, bcrypt hashing, and JWT auth middleware                         | ✅ Merged             |
| **2025-09-25** | Wikus  | `backend-setup`                | Finalized database schema and migrations for Users, Matches, Questions                 | ✅ Merged             |
| **2025-09-27** | Wikus  | `backend-setup`                | Added token validation middleware and protected route enforcement                      | ✅ Merged             |
| **2025-09-29** | Kyle   | `feature/kyle-play-game`       | Implemented (hard-coded) multiplayer player game play logic                            | ✅ Merged             |
| **2025-09-29** | Wikus  | `feature/wikus-auth`           | Implemented frontend JWT authentication; connected login/signup to backend             | ✅ Merged             |
| **2025-09-30** | Wikus  | `feature/wikus-auth`           | Fixed routing issues (Nginx rewrite); improved login/signup modal UX                   | ✅ Merged             |     |
| **2025-10-01** | Kyle   | `feature/kyle-play-game`       | Changed game play styling and implemented user set question timing                     | ✅ Merged             |
| **2025-10-02** | Wikus  | `feature/wikus-uploads`        | Added avatar upload endpoint and integrated URL-based avatar storage                   | ✅ Merged             |
| **2025-10-03** | Kyle   | `feature/kyle-play-game`       | Refactroed game play into multiple files                                               | ✅ Merged             |
| **2025-10-03** | Kyle   | `feature/kyle-play-game`       | Add quit button to game play                                                           | ✅ Merged             |
| **2025-10-03** | Wikus  | `feature/wikus-docker`         | Created multi-stage Dockerfile and Makefile; added Cloudflare Tunnel support           | ✅ Merged             |
| **2025-10-06** | Kyle   | `feature/scraper`              | Integrate database questions with category selection                                   | ✅ Merged             |
| **2025-10-06** | Kyle   | `feature/scraper`              | Implement shared OpenTDB utility file                                                  | ✅ Merged             |
| **2025-10-06** | Wikus  | `feature/wikus-socket-backend` | Implemented Socket.IO backend with match rooms and player tracking                     | ✅ Merged             |
| **2025-10-07** | Wikus  | `feature/socket-refactor`      | Added real-time join/leave events and per-match state updates via sockets              | ✅ Merged             |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Add timeLimit field to Match model                                                     | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Fix session cookie settings for localhost                                              | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Add debug logging to auth middleware                                                   | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Add JWT token generation for Socket.IO auth                                            | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Accept timeLimit parameter in match creation                                           | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Fix Socket.IO game logic and timing                                                    | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Use session cookies for API authentication                                             | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Save JWT tokens to localStorage                                                        | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Add dynamic categories and remove requireCorrectA                                      | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Use API service for match fetching                                                     | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Remove player count requirement for starting                                           | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Fix gameplay timing and leaderboard display                                            | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Use API service in settings modal                                                      | Not Merged            |
| **2025-10-08** | Wikus  | `feature/socket`               | Improved socket stability: fixed timer resets, enhanced logging, cleanup               | ✅ Merged             |
| **2025-10-09** | Wikus  | `feature/socket`               | Fixed "no token provided" error, verified multiplayer sync and host control            | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/socket`               | Add timeLimit field to Match model for configurable question duration                  | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/socket`               | Accept and validate timeLimit and numQuestions in match creation API                   | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/socket`               | Implement synchronized leaderboard timing using match timeLimit from DB                | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/socket`               | Fix timer bar animation - use 100ms transition for smooth countdown                    | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/socket`               | Add numQuestions slider and send timeLimit to backend API                              | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/socket`               | Implement precise timer updates and delay leaderboard until timer reaches 0            | ✅ Merged             |
| **2025-10-09** | Wikus  | `feature/socket / dev`         | Merged working feature socket into dev, dev mvp                                        | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/public-games`         | Add isPublic and status query filters to matches endpoint                              | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/public-games`         | End game for all players when host leaves                                              | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/public-games`         | Remove back to lobby button from game header                                           | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/public-games`         | Update JoinGame page to display public games list                                      | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/public-games`         | Add real time polling and remove category dropdown from join game lobby                | ✅ Merged             |
| **2025-10-09** | Kyle   | `feature/public-games`         | Handle hostLeft event during gameplay to end match                                     | ✅ Merged             |
| **2025-10-10** | Kyle   | `feature/public-games`         | Removed hard coded public games                                                        | ✅ Merged             |
| **2025-10-10** | Kyle   | `feature/public-games`         | Fixed navigation, ensure descriptive button labels                                     | ✅ Merged             |
| **2025-10-10** | Kyle   | `feature/public-games`         | Implemented complete/incomplete game validation (stats discarded for incomplete games) | ✅ Merged             |

---

## 🕒 Last Updated

**Timestamp:** 2025-10-10 07:37
**Updated by:** Kyle Cohead

**Timestamp:** 2025-10-09 21:23
**Updated by:** Kyle Cohead

**Timestamp:** 2025-10-09 15:30
**Updated by:** Wikus van Biljon

**Timestamp:** 2025-10-09 9:00
**Updated by:** Kyle Cohead
