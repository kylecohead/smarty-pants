FROM node:22-alpine

WORKDIR /app

# Install Postgres client (needed for pg_isready in entrypoint.sh)
RUN apk add --no-cache postgresql-client

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Copy backend source
COPY . .

# Ensure entrypoint.sh is executable
RUN chmod +x /app/entrypoint.sh

# Ensure uploads folder exists
RUN mkdir -p /app/uploads

# Pre-generate Prisma client at build time
RUN npx prisma generate

EXPOSE 3000

# Use entrypoint script (handles wait-for-db, push, seed, start)
CMD ["sh", "/app/entrypoint.sh"]
