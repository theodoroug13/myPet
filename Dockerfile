# -----------------------------
# Build Stage (Vite/React build)
# -----------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Install deps (better layer caching)
COPY package*.json ./
RUN npm install


COPY . .
RUN npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY pictures /usr/share/nginx/html/pictures

EXPOSE 80
