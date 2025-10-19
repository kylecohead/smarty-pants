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
| **Amy McDermott**    | **26911264**   | Multifunctional & database       | leaderboard, game scheduling, match history                                                       |
| **Kyle Cohead**      | **25964917**   | Admin functionality and scraping | Socket.IO setup, live gameplay logic                                                              |
| **Wikus van Biljon** | **26927543**   | authentication                   | Login and signup, Docker, Socket.IO, version control                                              |

---

## 🗓️ Daily Work Log

| Date           | Member | Branch                         | Description of Work Done                                                               | Commit / Merge Status |
| -------------- | ------ | ------------------------------ | -------------------------------------------------------------------------------------- | --------------------- |
| **2025-09-19** | Wikus  | `main`                         | Project setup complete, initial files committed, database seeded                       | ✅                    |
| **2025-09-19** | Wikus  | `main`                         | Added Docker setup and Prisma database schema with seed data                           | ✅                    |
| **2025-09-19** | Nina   | `main`                         | Initialized React project with Vite and Tailwind                                       | ✅                    |
| **2025-09-19** | Nina   | `main`                         | Initialized all pages & routing to pages                                               | ✅                    |
| **2025-09-19** | Wikus  | `dev`                          | Set up Express backend, Docker Compose, and initial API routes                         | ✅                    |
| **2025-09-20** | Nina   | `feature/Nina-createAndJoin`   | Created Join Game Lobby static layout and navigation to `JoinGame.jsx`                 | ✅                    |
| **2025-09-20** | Kyle   | `feature/kyle-play-game`       | Implemented single player game play logic                                              | ✅                    |
| **2025-09-20** | Wikus  | `dev`                          | Added initial Prisma schema and basic user authentication                              | ✅                    |
| **2025-09-20** | Wikus  | `dev`                          | Integrated Nina’s changes and Docker Compose configuration for backend/frontend        | ✅                    |
| **2025-09-23** | Wikus  | `backend-setup`                | Integrated Prisma ORM, bcrypt hashing, and JWT auth middleware                         | ✅                    |
| **2025-09-24** | Nina   | `feature/Nina-landingPage`     | Create the landing page controls - leaderboard & settings                              | ✅                    |
| **2025-09-25** | Wikus  | `backend-setup`                | Finalized database schema and migrations for Users, Matches, Questions                 | ✅                    |
| **2025-09-27** | Wikus  | `backend-setup`                | Added token validation middleware and protected route enforcement                      | ✅                    |
| **2025-09-28** | Wikus  | `feature/socket-backend`       | Added initial Socket.IO backend integration and test support                           | ✅                    |
| **2025-09-28** | Nina   | `feature/Nina-landingPage`     | Landing page controls - version 2 functionality                                        | ✅                    |
| **2025-09-29** | Kyle   | `feature/kyle-play-game`       | Implemented (hard-coded) multiplayer player game play logic                            | ✅                    |
| **2025-09-29** | Amy    | `feature/amy-lobby`            | Implement lobby feature, simulating players joining every 2 seconds                    | ✅                    |
| **2025-09-29** | Nina   | `feature/Nina-createAndJoin`   | Create the MVP Create game screen with styling                                         | ✅                    |
| **2025-09-29** | Wikus  | `feature/wikus-auth`           | Implemented frontend JWT authentication; connected login/signup to backend             | ✅                    |
| **2025-09-30** | Wikus  | `feature/wikus-auth`           | Fixed routing issues (Nginx rewrite); improved login/signup modal UX                   | ✅                    |
| **2025-09-30** | Nina   | `feature/Nina-createAndJoin`   | Create the MVP Join game screen with styling                                           | ✅                    |
| **2025-10-01** | Kyle   | `feature/kyle-play-game`       | Changed game play styling and implemented user set question timing                     | ✅                    |
| **2025-10-02** | Wikus  | `feature/wikus-uploads`        | Added avatar upload endpoint and integrated URL-based avatar storage                   | ✅                    |
| **2025-10-02** | Amy    | `feature/amy-lobby`            | Merged lobby into dev                                                                  | ✅                    |
| **2025-10-03** | Kyle   | `feature/kyle-play-game`       | Refactored game play into multiple files                                               | ✅                    |
| **2025-10-03** | Kyle   | `feature/kyle-play-game`       | Add quit button to game play                                                           | ✅                    |
| **2025-10-03** | Wikus  | `feature/wikus-docker`         | Created multi-stage Dockerfile and Makefile; added Cloudflare Tunnel support           | ✅                    |
| **2025-10-06** | Kyle   | `feature/scraper`              | Integrate database questions with category selection                                   | ✅                    |
| **2025-10-06** | Kyle   | `feature/scraper`              | Implement shared OpenTDB utility file                                                  | ✅                    |
| **2025-10-06** | Wikus  | `feature/wikus-socket-backend` | Implemented Socket.IO backend with match rooms and player tracking                     | ✅                    |
| **2025-10-07** | Wikus  | `feature/socket-refactor`      | Added real-time join/leave events and per-match state updates via sockets              | ✅                    |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Add timeLimit field to Match model                                                     | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Fix session cookie settings for localhost                                              | Not Merged            |
| **2025-10-08** | Nina   | `feature/frontend-styling`     | Style Smartie pants home screen - version 1                                            | ✅                    |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Add debug logging to auth middleware                                                   | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Add JWT token generation for Socket.IO auth                                            | Not Merged            |
| **2025-10-08** | Nina   | `feature/frontend-styling`     | Style Smartie pants home screen - version 2 - fix buttons                              | ✅                    |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Accept timeLimit parameter in match creation                                           | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Fix Socket.IO game logic and timing                                                    | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Use session cookies for API authentication                                             | Not Merged            |
| **2025-10-08** | Nina   | `feature/frontend-styling`     | Style Smartie pants landing screen MVP - version 1                                     | ✅                    |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Save JWT tokens to localStorage                                                        | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Add dynamic categories and remove requireCorrectA                                      | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Use API service for match fetching                                                     | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Remove player count requirement for starting                                           | Not Merged            |
| **2025-10-08** | Nina   | `feature/frontend-styling`     | Style Smartie pants landing page leader board                                          | ✅                    |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Fix gameplay timing and leaderboard display                                            | Not Merged            |
| **2025-10-08** | Kyle   | `feature/fixGame`              | Use API service in settings modal                                                      | Not Merged            |
| **2025-10-08** | Wikus  | `feature/socket`               | Improved socket stability: fixed timer resets, enhanced logging, cleanup               | ✅                    |
| **2025-10-08** | Nina   | `feature/frontend-styling`     | Style Smartie pants home screen smartie pants title                                    | ✅                    |
| **2025-10-09** | Nina   | `feature/frontend-styling`     | Style Smartie pants home screen - Fix bugs                                             | ✅                    |
| **2025-10-09** | Wikus  | `feature/socket`               | Fixed "no token provided" error, verified multiplayer sync and host control            | ✅                    |
| **2025-10-09** | Kyle   | `feature/socket`               | Add timeLimit field to Match model for configurable question duration                  | ✅                    |
| **2025-10-09** | Kyle   | `feature/socket`               | Accept and validate timeLimit and numQuestions in match creation API                   | ✅                    |
| **2025-10-09** | Nina   | `feature/frontend-styling`     | Style Smartie Pants - profile card styling containers                                  | ✅                    |
| **2025-10-09** | Kyle   | `feature/socket`               | Implement synchronized leaderboard timing using match timeLimit from DB                | ✅                    |
| **2025-10-09** | Kyle   | `feature/socket`               | Fix timer bar animation - use 100ms transition for smooth countdown                    | ✅                    |
| **2025-10-09** | Kyle   | `feature/socket`               | Add numQuestions slider and send timeLimit to backend API                              | ✅                    |
| **2025-10-09** | Nina   | `feature/frontend-styling`     | Added stick man functionality version 1                                                | ✅                    |
| **2025-10-09** | Kyle   | `feature/socket`               | Implement precise timer updates and delay leaderboard until timer reaches 0            | ✅                    |
| **2025-10-09** | Wikus  | `feature/socket / dev`         | Merged working feature socket into dev, dev MVP                                        | ✅                    |
| **2025-10-09** | Kyle   | `feature/public-games`         | Add isPublic and status query filters to matches endpoint                              | ✅                    |
| **2025-10-09** | Kyle   | `feature/public-games`         | End game for all players when host leaves                                              | ✅                    |
| **2025-10-09** | Nina   | `feature/frontend-styling`     | Add stick man functionality version 2 - change colour                                  | ✅                    |
| **2025-10-09** | Nina   | `feature/frontend-styling`     | Add stickman functionality version 3 - change thickness                                | ✅                    |
| **2025-10-09** | Kyle   | `feature/public-games`         | Remove back to lobby button from game header                                           | ✅                    |
| **2025-10-09** | Kyle   | `feature/public-games`         | Update JoinGame page to display public games list                                      | ✅                    |
| **2025-10-09** | Nina   | `feature/frontend-styling`     | Design and add about modal                                                             | ✅                    |
| **2025-10-09** | Kyle   | `feature/public-games`         | Add real time polling and remove category dropdown from join game lobby                | ✅                    |
| **2025-10-09** | Nina   | `feature/frontend-styling`     | Add stickman functionality version 4 - change thickness, height and width              | ✅                    |
| **2025-10-09** | Nina   | `feature/frontend-styling`     | Add stickman characteristics to database schema                                        | ✅                    |
| **2025-10-09** | Nina   | `feature/frontend-styling`     | Styling settings page                                                                  | ✅                    |
| **2025-10-09** | Kyle   | `feature/public-games`         | Handle hostLeft event during gameplay to end match                                     | ✅                    |
| **2025-10-10** | Kyle   | `feature/public-games`         | Removed hard coded public games                                                        | ✅                    |
| **2025-10-10** | Kyle   | `feature/public-games`         | Fixed navigation, ensure descriptive button labels                                     | ✅                    |
| **2025-10-10** | Nina   | `feature/frontend-styling`     | Style Smartie pants settings page - bug fixes                                          | ✅                    |
| **2025-10-10** | Nina   | `feature/frontend-styling`     | Style Smartie pants Game Menu styling - design & add background                        | ✅                    |
| **2025-10-10** | Kyle   | `feature/public-games`         | Implemented complete/incomplete game validation (stats discarded for incomplete games) | ✅                    |
| **2025-10-10** | Nina   | `feature/frontend-styling`     | Final landing page and gameMenu page styling                                           | ✅                    |
| **2025-10-10** | Wikus  | `feature/wikus-prod`           | Implemented production Docker deployment workflow, Cloudflare tunnel setup             | ✅                    |
| **2025-09-11** | Nina   | `feature/Nina-StylingGamePlay` | Design background images for create & host screen and implement                        | ✅                    |
| **2025-10-12** | Wikus  | `feature/deploy`               | Added deploy links, fixed favicon/title, deployment tested on Ubuntu hosting           | ✅                    |
| **2025-09-12** | Nina   | `feature/Nina-StylingGamePlay` | Design background images for hosting screen and implement                              | ✅                    |
| **2025-09-12** | Nina   | `feature/Nina-StylingGamePlay` | Design background images for the create & join game and implement                      | ✅                    |
| **2025-09-12** | Nina   | `feature/Nina-StylingGamePlay` | Design background images for in GamePlay and implement styling                         | ✅                    |
| **2025-09-12** | Nina   | `feature/Nina-StylingGamePlay` | Style the question Recap modal                                                         | ✅                    |
| **2025-09-12** | Nina   | `feature/Nina-StylingGamePlay` | Style the GamePlay modal - version 1                                                   | ✅                    |
| **2025-09-12** | Nina   | `feature/Nina-StylingGamePlay` | Style the GamePlay modal - version 2                                                   | ✅                    |
| **2025-09-12** | Nina   | `feature/Nina-StylingGamePlay` | Style the gameOver modal                                                               | ✅                    |
| **2025-10-12** | Wikus  | `feature/deploy`               | Completed production deployment with Makefile automation and Nginx reverse proxy       | ✅                    |
| **2025-10-12** | Conrad | `feature/conrad-admin`         | Implemented refresh tokens and the send, receive, accept and decline of game invites.  | ✅                    |
| **2025-10-12** | Kyle   | `feature/correct`              | Added correct answer viewing after each question and lobby max players                 | ✅                    |
| **2025-10-12** | Amy    | `feature/amy-scores`           | Add number-of-matches-played logic; add game wins counting; add best-score logic       | ✅                    |
| **2025-10-12** | Amy    | `feature/amy-scores`           | Settings page shows user-specific data (stats)                                         | ✅                    |
| **2025-10-13** | Amy    | `feature/amy-scores`           | Add leaderboard logic                                                                  | ✅                    |
| **2025-10-13** | Amy    | `feature/amy-scores`           | Add user match history to Landing page                                                 | ✅                    |
| **2025-10-13** | Wikus  | `feature/tiebreak`             | Added tiebreak logic, updated stats auth flow and round number handling                | ✅                    |
| **2025-10-14** | Nina   | `dev`                          | Add new attributes to database schema                                                  | ✅                    |
| **2025-10-15** | Wikus  | `feature/stats-update`         | Fixed player stats persistence, improved delete and settings update flow               | ✅                    |
| **2025-10-15** | Amy    | `feature/amy-scheduling`       | Initial scheduling logic for creating matches                                          | ✅                    |
| **2025-10-15** | Nina   | `dev`                          | Change background images                                                               | ✅                    |
| **2025-10-16** | Amy    | `feature/amy-scheduling`       | Working game scheduling; add scheduling UI styling                                     | ✅                    |
| **2025-10-17** | Kyle   | `feature/difficulty`           | Add question difficulty selecting and seed 20 Q's/cat                                  | ✅                    |
| **2025-10-17** | Wikus  | `feature/rounds`               | Added multi-round functionality, fixed round transition logic, logging improvements    | ✅                    |
| **2025-10-18** | Amy    | `feature/amy-scores`           | Remove notifications on leaderboard (cleanup/UX)                                       | ✅                    |
| **2025-10-18** | Kyle   | `feature/adminEdit`            | Add admin feature: edit questions manually                                             | ✅                    |
| **2025-10-18** | Conrad | `feature/conrad-admin`         | Added email invites and fixed auth                                                     | ✅                    |
| **2025-10-18** | Conrad | `feature/conrad-admin`         | Added scheduling for private games                                                     | ✅                    |
| **2025-10-18** | Conrad | `feature/conrad-admin`         | Added multiple rounds                                                                  | ✅                    |
| **2025-10-19** | Kyle   | `feature/adminSched`           | Add scheduled games to admin live games list                                           | ✅                    |
| **2025-10-19** | Kyle   | `feature/adminSched`           | Add filtering and searching games for admins                                           | ✅                    |

---

## 🕒 Last Updated

**Timestamp:** 2025-10-15:56  
**Updated by:** Nina Swart

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

**Timestamp:** 2025-10-18 13:32  
**Updated by:** Nina Swart

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

**Timestamp:** 2025-09-19 22:22  
**Updated by:** Nina Swart
