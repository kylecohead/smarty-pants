FROM node:22-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Serve with lightweight web server
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
