# 📘 Project 2 – Development Log

**Team:** Multi-player Trivia Tournament  
**Course:** Computer Science 343  
**Date Started:** 2025-09-19  
**Repository Branches:** `main`, `dev`, feature branches (list)

---

## 🧑‍💻 Team Members & Roles

| Name                 | Student Number | Primary Role                     | Primary Responsibilities                                                                          |
| -------------------- | -------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Conrad Joubert**   | 26989581       | Game invites and authentication  | Send, receive, accept and decline invitations to games to and from players, Refresh token control |
| **Nina Swart**       | **26970341**   | Frontend Developer               | Styling, landing page, create & join game frontend                                                |
| **Amy McDermott**    | **26911264**   | idk                              | leaderboard, game scheduling, match history                                                       |
| **Kyle Cohead**      | **25964917**   | Admin functionality and scraping | Socket.IO setup, live gameplay logic                                                              |
| **Wikus van Biljon** | **26927543**   | authentication                   | Login and signup, Docker, Socket.IO, version control                                              |

---

## 🗓️ Daily Work Log

| Date           | Member | Branch                         | Description of Work Done                                                               | Commit / Merge Status |
| -------------- | ------ | ------------------------------ | -------------------------------------------------------------------------------------- | --------------------- |
| **2025-09-19** | Wikus  | `main`           | Project setup complete, initial files committed, database seeded                             | ✅ Merged              |
| **2025-09-19** | Wikus  | `main`           | Added Docker setup and Prisma database schema with seed data                                 | ✅ Merged              |
| **2025-09-19** | Nina   | `main`                         | Initialized React project with Vite and Tailwind                                       | ✅ Merged             |
| **2025-09-19** | Nina   | `main`                         | Initialized all pages & routing to pages                                               | ✅ Merged             |
| **2025-09-19** | Wikus  | `dev`                          | Set up Express backend, Docker Compose, and initial API routes                         | ✅ Merged             |
| **2025-09-20** | Nina   | `feature/Nina-createAndJoin`   | Created Join Game Lobby static layout and navigation to `JoinGame.jsx`                 | ✅ Merged             |
| **2025-09-20** | Kyle   | `feature/kyle-play-game`       | Implemented single player game play logic                                              | ✅ Merged             |
| **2025-09-20** | Wikus  | `dev`                          | Added initial Prisma schema and basic user authentication                              | ✅ Merged             |
| **2025-09-20** | Wikus  | `dev`                     | Integrated Nina’s changes and Docker Compose configuration for backend/frontend              | ✅ Merged              |
| **2025-09-23** | Wikus  | `backend-setup`                | Integrated Prisma ORM, bcrypt hashing, and JWT auth middleware                         | ✅ Merged             |
| **2025-09-25** | Wikus  | `backend-setup`                | Finalized database schema and migrations for Users, Matches, Questions                 | ✅ Merged             |
| **2025-09-27** | Wikus  | `backend-setup`                | Added token validation middleware and protected route enforcement                      | ✅ Merged             |
| **2025-09-28** | Wikus  | `feature/socket-backend`  | Added initial Socket.IO backend integration and test support                                 | ✅ Merged              |
| **2025-09-29** | Kyle   | `feature/kyle-play-game`       | Implemented (hard-coded) multiplayer player game play logic                            | ✅ Merged             |
| **2025-09-29** | Amy    | `feature/amy-lobby`            | Implement lobby feature, simulating players joining every 2 seconds                    | ✅ Merged             |
| **2025-09-29** | Wikus  | `feature/wikus-auth`           | Implemented frontend JWT authentication; connected login/signup to backend             | ✅ Merged             |
| **2025-09-30** | Wikus  | `feature/wikus-auth`           | Fixed routing issues (Nginx rewrite); improved login/signup modal UX                   | ✅ Merged             |
| **2025-10-01** | Kyle   | `feature/kyle-play-game`       | Changed game play styling and implemented user set question timing                     | ✅ Merged             |
| **2025-10-02** | Wikus  | `feature/wikus-uploads`        | Added avatar upload endpoint and integrated URL-based avatar storage                   | ✅ Merged             |
| **2025-10-02** | Amy    | `feature/amy-lobby`            | Merged lobby into dev                                                                  | ✅ Merged             |
| **2025-10-03** | Kyle   | `feature/kyle-play-game`       | Refactored game play into multiple files                                               | ✅ Merged             |
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
| **2025-10-10** | Wikus  | `feature/wikus-prod`      | Implemented production Docker deployment workflow, Cloudflare tunnel setup                   | ✅ Merged              |
| **2025-10-12** | Wikus  | `feature/deploy`          | Added deploy links, fixed favicon/title, deployment tested on Ubuntu hosting                 | ✅ Merged              |
| **2025-10-13** | Wikus  | `feature/deploy`          | Completed production deployment with Makefile automation and Nginx reverse proxy             | ✅ Merged              |
| **2025-10-11** | Conrad | `feature/conrad-admin`         | Implemented refresh tokens and the send, receive, accept and decline of game invites.  | ✅ Merged             |
| **2025-10-12** | Kyle   | `feature/correct`              | Added correct answer viewing after each question and lobby max players                 | ✅ Merged             |
| **2025-10-12** | Amy    | `feature/amy-scores`           | Add number-of-matches-played logic; add game wins counting; add best-score logic       | ✅ Merged             |
| **2025-10-12** | Amy    | `feature/amy-scores`           | Settings page shows user-specific data (stats)                                         | ✅ Merged             |
| **2025-10-13** | Amy    | `feature/amy-scores`           | Add leaderboard logic                                                                  | ✅ Merged             |
| **2025-10-13** | Amy    | `feature/amy-scores`           | Add user match history to Landing page                                                 | ✅ Merged             |
| **2025-10-14** | Wikus  | `feature/tiebreak`        | Added tiebreak logic, updated stats auth flow and round number handling                      | ✅ Merged              |
| **2025-10-15** | Wikus  | `feature/stats-update`    | Fixed player stats persistence, improved delete and settings update flow                     | ✅ Merged              |
| **2025-10-15** | Amy    | `feature/amy-scheduling`       | Initial scheduling logic for creating matches                                          | ✅ Merged             |
| **2025-10-16** | Amy    | `feature/amy-scheduling`       | Working game scheduling; add scheduling UI styling                                     | ✅ Merged             |
| **2025-10-17** | Kyle   | `feature/difficulty`           | Add question difficulty selecting and seed 20 Q's/cat                                  | ✅ Merged             |
| **2025-10-17** | Wikus  | `feature/rounds`          | Added multi-round functionality, fixed round transition logic, logging improvements          | ✅ Merged              |
| **2025-10-18** | Amy    | `feature/amy-scores`           | Remove notifications on leaderboard (cleanup/UX)                                       | ✅ Merged             |
| **2025-10-18** | Kyle   | `feature/adminEdit`            | Add admin feature: edit questions manually                                             | ✅ Merged             |
| **2025-10-18** | Conrad | `feature/conrad-admin`         | Added email invites and fixed auth                                                     | ✅ Merged             |
| **2025-10-18** | Conrad | `feature/conrad-admin`         | Added scheduling for private games                                                     | ✅ Merged             |
| **2025-10-18** | Conrad | `feature/conrad-admin`         | Added multiple rounds                                                                  | ✅ Merged             |
| **2025-10-19** | Kyle   | `feature/adminSched`           | Add scheduled games to admin live games list                                           | ✅ Merged             |
| **2025-10-19** | Kyle   | `feature/adminSched`           | Add filtering and searching games for admins                                           | ✅ Merged             |


    










## 🕒 Last Updated

**Timestamp** 2025-10-19 13:05
**Updated by** Wikus van Biljon

**Timestamp** 2025-10-19 13:00
**Updated by** Kyle Cohead

**Timestamp** 2025-10-18 20:45
**Updated by** Conrad Joubert

**Timestamp** 2025-10-18 14:00
**Updated by** Kyle Cohead

**Timestamp** 2025-10-18 12:00
**Updated by** Amy McDermott

**Timestamp:** 2025-10-11 15:30
**Updated by:** Conrad Joubert

**Timestamp:** 2025-10-10 07:37
**Updated by:** Kyle Cohead

**Timestamp:** 2025-10-09 21:23
**Updated by:** Kyle Cohead

**Timestamp:** 2025-10-09 15:30
**Updated by:** Wikus van Biljon

**Timestamp:** 2025-10-09 9:00
**Updated by:** Kyle Cohead
