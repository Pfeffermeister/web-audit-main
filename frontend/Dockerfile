# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Definiere Build-Args für Vite Umgebungsvariablen
ARG VITE_API_BASE_URL

# Setze ENV-Variablen für den Build-Prozess
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

# Verwende Standard nginx config (nginx-Proxy nicht mehr nötig)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
