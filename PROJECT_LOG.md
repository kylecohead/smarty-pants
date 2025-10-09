# 📘 Project 2 – Development Log

**Team:** Multi-player Trivia Tournament  
**Course:** Computer Science 343  
**Date Started:** 2025-09-19  
**Repository Branches:** `main`, `dev`, feature branches (list)

---

## 🧑‍💻 Team Members & Roles

| Name               | Student Number   | Primary Role       | Primary Responsibilities                                  |
| ------------------ | ---------------- | ------------------ | --------------------------------------------------------- |
| [Your Name]        | [Your Student #] | Frontend Developer | React components, styling, UI improvements, profile pages |
| **Nina Swart**     | **26970341**     | Frontend Developer | Styling, landing page, create & join game frontend        |
| [Teammate 2]       | [Student #]      | Database Engineer  | PostgreSQL schema, normalization (3NF), Prisma setup      |
| **Kyle Cohead**    | **25964917**     | Real-time Systems  | Socket.IO setup, live gameplay logic                      |
|**Wikus van Biljon**|**26927543**      | authentication     | Login and signup, , Socket.IO, version control            |

---

## 🗓️ Daily Work Log

| Date           | Member       | Branch                       | Description of Work Done                                                    | Commit / Merge Status |
| -------------- | ------------ | ---------------------------- | --------------------------------------------------------------------------- | --------------------- |
| **2025-09-19** | Nina         | `main`                       | Initialized React project with Vite and Tailwind                            | ✅ Merged             |
| **2025-09-19** | Nina         | `main`                       | Initialized all pages & routing to pages                                    | ✅ Merged             |
| **2025-09-20** | Nina         | `feature/Nina-createAndJoin` | Created Join Game Lobby static layout and navigation to `JoinGame.jsx`      | ✅ Merged             |
| **2025-09-21** | [Teammate 1] | `backend-setup`              | Configured Express server, Prisma connection, and route skeleton            | ✅ Merged             |
| **2025-10-01** | [Teammate 2] | `db-models`                  | Designed PostgreSQL schema for Users, Matches, and Questions (3NF)          | ✅ Merged             |
| **2025-09-20** | Kyle         | `feature/kyle-play-game`     | Implemented single player game play logic                                   | ✅ Merged             |
| **2025-09-29** | Kyle         | `feature/kyle-play-game`     | Implemented (hard-coded) multiplayer player game play logic                 | ✅ Merged             |
| **2025-10-01** | Kyle         | `feature/kyle-play-game`     | Changed game play styling and implemented user set question timing          | ✅ Merged             |
| **2025-10-03** | Kyle         | `feature/kyle-play-game`     | Refactroed game play into multiple files                                    | ✅ Merged             |
| **2025-10-03** | Kyle         | `feature/kyle-play-game`     | Add quit button to game play                                                | ✅ Merged             |
| **2025-10-06** | Kyle         | `feature/scraper`            | Integrate database questions with category selection                        | ✅ Merged             |
| **2025-10-06** | Kyle         | `feature/scraper`            | Implement shared OpenTDB utility file                                       | ✅ Merged             |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Add timeLimit field to Match model                                          | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Fix session cookie settings for localhost                                   | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Add debug logging to auth middleware                                        | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Add JWT token generation for Socket.IO auth                                 | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Accept timeLimit parameter in match creation                                | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Fix Socket.IO game logic and timing                                         | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Use session cookies for API authentication                                  | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Save JWT tokens to localStorage                                             | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Add dynamic categories and remove requireCorrectA                           | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Use API service for match fetching                                          | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Remove player count requirement for starting                                | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Fix gameplay timing and leaderboard display                                 | Not Merged            |
| **2025-10-08** | Kyle         | `feature/fixGame`            | Use API service in settings modal                                           | Not Merged            |
| **2025-10-09** | Kyle         | `feature/socket`             | Add timeLimit field to Match model for configurable question duration       | ✅ Merged             |
| **2025-10-09** | Kyle         | `feature/socket`             | Accept and validate timeLimit and numQuestions in match creation API        | ✅ Merged             |
| **2025-10-09** | Kyle         | `feature/socket`             | Implement synchronized leaderboard timing using match timeLimit from DB     | ✅ Merged             |
| **2025-10-09** | Kyle         | `feature/socket`             | Fix timer bar animation - use 100ms transition for smooth countdown         | ✅ Merged             |
| **2025-10-09** | Kyle         | `feature/socket`             | Add numQuestions slider and send timeLimit to backend API                   | ✅ Merged             |
| **2025-10-09** | Kyle         | `feature/socket`             | Implement precise timer updates and delay leaderboard until timer reaches 0 | ✅ Merged             |

---

## 🕒 Last Updated

**Timestamp:** 2025-10-09 9:00
**Updated by:** Kyle Cohead
