## Multi-stage Dockerfile for building and serving the Vite app
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json .
COPY pnpm-lock.yaml* ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Production stage - serve static files with nginx
FROM nginx:stable-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
