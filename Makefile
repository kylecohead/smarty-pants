# make file

.PHONY: reset backend frontend seed logs

# Reset everything: stop, nuke containers/images/volumes, rebuild, start, push schema, seed DB
reset:
	docker compose down -v
	docker compose rm -f
	docker builder prune -af
	docker image prune -af
	docker volume prune -f
	docker compose build --no-cache
	docker compose up -d
	docker compose exec backend npx prisma db push
	docker compose exec backend npx prisma db seed

# Rebuild and restart backend only
backend:
	docker compose build backend --no-cache
	docker compose up -d backend
	docker compose exec backend npx prisma db push
	docker compose exec backend npx prisma db seed

# Rebuild and restart frontend only
frontend:
	docker compose build frontend --no-cache
	docker compose up -d frontend

# Re-run seed script (without resetting containers/images)
# seed:
# 	docker compose exec backend npx prisma db seed

# Tail logs from all services
logs:
	docker compose logs -f



# Re-run seed script (without resetting containers/images)
seed:
	docker compose exec backend npx prisma db push --force-reset
	docker compose exec backend npm run db:seed


# Run normally
run:
	docker compose up -d

# Drop into Postgres psql shell
db:
	docker compose exec db psql -U postgres -d trivia

# Stop the docker
stop:
	docker compose down


# Build entire image and run
build:
	docker compose up --build -d
