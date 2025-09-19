FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy code
COPY backend/ .

# Generate prisma client
RUN npx prisma generate

# Expose API port
EXPOSE 3000

CMD ["npm", "run", "dev"]
