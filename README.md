# Smartie-Pants


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
Smartie-Pants/
 ├─ backend/
 │   ├─ package.json
 │   ├─ prisma/
 │   └─ src/
 ├─ frontend/
 │   ├─ package.json
 │   └─ src/
 ├─ docker-compose.yml
 ├─ .dockerignore
 ├─ README.md
