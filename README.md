# Smartie-Pants
## Frontend
http://localhost:5173/

## Requirements
-Docker
-Compose


## Login Details
Nina	nina@example.com	1234	USER

Wikus	wikus@example.com	1234	USER

Amy	    amy@example.com	    1234	USER

Conrad	conrad@example.com	1234	USER

Kyle	kyle@example.com	1234	USER

Admin	admin@example.com	1234	ADMIN

## Project commands
1. Run with no changes
```bash
make run
```

2. Full reset (Applies database changes)
```bash
make reset
```

3. Rebuild only backend
```bash
make backend
```

4. Rebuild only frontend
```bash
make frontend
```

5. Re-seed database (drop + recreate schema + seed)
```bash
make seed
```

6. View logs(usefull if startup fails)
```bash
make logs
```

7. Access Postgres shell
```bash
make db
#SELECT * FROM "User";

```

8. Stop docker
```bash
make stop
```

9. Rebuild entire image
```bash
make build
```


10. Socket Testing (Real time Updates)
- Run the following commands after the docker is running:
- Run each in a different terminal
```bash
make test-socket USER=Alice
make test-socket USER=Bob
```

11. Nuke (removes all docker images and redownloads everything)
```bash
make nuke
```



1. Project Structure
```
Smartie-Pants
├── backend
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── generated
│   │   └── prisma
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── scripts
│   │   ├── checkCounts.mjs
│   │   └── testFetch.mjs
│   ├── src
│   │   ├── config
│   │   ├── index.js
│   │   ├── middleware
│   │   ├── routes
│   │   ├── socket.js
│   │   ├── test.js
│   │   └── utils
│   └── uploads
├── docker-compose.prod.yml
├── docker-compose.yml
├── docs.txt
├── frontend
│   ├── design-tokens.md
│   ├── dist
│   │   ├── assets
│   │   ├── index.html
│   │   └── vite.svg
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── App.jsx
│   │   ├── assets
│   │   ├── components
│   │   ├── config
│   │   ├── data
│   │   ├── hooks
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── modals
│   │   ├── pages
│   │   ├── services
│   │   └── utils
│   ├── tailwind.config.js
│   └── vite.config.js
├── Makefile
├── nginx.conf
└── README.md
```

## Deploy
https://play.smartiepants.art
```bash
#server command also use (make prod)
docker compose -f docker-compose.prod.yml exec frontend npm run build

```
