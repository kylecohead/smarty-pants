# Smartie-Pants
## Frontend
http://localhost:5173/


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

2. Full reset (Nuke everything)
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
```

8. Stop docker
```bash
make stop
```

9. Rebuild entire image
```bash
make build
```



1. Project Structure
```
Smartie-Pants
├── backend
│   ├── Dockerfile
│   ├── generated
│   │   └── prisma
│   ├── node_modules
│   ├── package.json
│   ├── package-lock.json
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src
│       └── index.js
├── docker-compose.yml
├── frontend
│   ├── design-tokens.md
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
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
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── modals
│   │   └── pages
│   ├── tailwind.config.js
│   └── vite.config.js
├── Makefile
└── README.md
```