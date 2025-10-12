# make file

.PHONY: reset backend frontend seed logs

# Reset database and code: stop
reset:
	docker compose down -v
	docker compose build
	docker compose up -d

	@echo "⏳ Waiting for Postgres to be healthy..."
	@until docker compose exec -T db pg_isready -U postgres -d trivia > /dev/null 2>&1; do \
		sleep 2; \
	done
	@echo "✅ Postgres is ready. Recreating schema..."
	docker compose exec -T db psql -U postgres -d trivia -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA IF NOT EXISTS public;"

	@echo "✅ Schema recreated. Applying Prisma schema..."
	docker compose exec -T backend npx prisma db push --force-reset --accept-data-loss || true
	@echo "✅ Prisma schema applied successfully!"

	@echo "⏳ Waiting for backend to be ready..."
	@until docker compose exec -T backend node -e "process.exit(0)" > /dev/null 2>&1; do \
		sleep 3; \
	done
	@echo "✅ Backend is up. Seeding database..."
	docker compose exec -T backend node prisma/seed.js


# nuke containers/images/volumes, rebuild, start, push schema, seed DB
nuke:
	# Stop and remove all containers, networks, volumes, and images
	docker compose down -v --rmi all --remove-orphans
	docker system prune -af --volumes
	# Rebuild everything with no cache
	docker compose build --no-cache
	docker compose up -d --force-recreate
	# Wait a bit for DB to be ready
	@echo "⏳ Waiting for Postgres..."
	@until docker compose exec -T db pg_isready -U postgres -d trivia; do \
		sleep 2; \
	done
	# Push schema and seed database
	@echo "✅ Postgres is ready. Resetting schema..."
	docker compose exec backend npx prisma db push --force-reset
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

test-socket:
	@node backend/src/test.js $(USER)


# -------- PRODUCTION --------
#this is not working.... yet
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

prod-logs:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# -------- DEPLOY WITH CLOUDFLARE --------
tunnel:
	- pkill cloudflared  # ignore if no process
	cloudflared tunnel --url http://localhost:5173/

# -------- CLEAN UP --------
free-ports:
	# Free up ports used by this project
	-docker stop $$(docker ps -q --filter "publish=5173") || true
	-docker rm -f $$(docker ps -q --filter "publish=5173") || true
	-docker stop $$(docker ps -q --filter "publish=3000") || true
	-docker rm -f $$(docker ps -q --filter "publish=3000") || true
	-docker stop $$(docker ps -q --filter "publish=5432") || true
	-docker rm -f $$(docker ps -q --filter "publish=5432") || true
