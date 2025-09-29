FROM node:22-alpine

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm install

# copy backend code
COPY . .


# Ensure uploads folder exists
RUN mkdir -p /app/uploads

# build-time generate (for prod images)
RUN npx prisma generate

EXPOSE 3000

# runtime generate (for dev) + start server
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
