# Smartie-Pants


## Running the project ( no changes made)
1. docker compose up
    Front-end:
    - http://localhost:5173


## Nuke project (Full reset)
```bash
 docker compose down -v            # stop and drop volumes
 docker compose rm -f              # remove stopped containers
 docker builder prune -af          # clear build cache
 docker image prune -af            # clear dangling/old images
 docker volume prune -f            # (optional) extra cleanup
 docker compose build --no-cache 
 docker compose up -d 
 docker compose exec backend npx prisma db push   # creates tables
 docker compose exec backend npx prisma db seed   # fills with minimal test data



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
