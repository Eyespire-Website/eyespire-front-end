# Multi-stage build for React application
# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Accept build arguments
ARG REACT_APP_API_BASE_URL=http://localhost:8080/api
ARG REACT_APP_ENVIRONMENT=production

# Set environment variables for build
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT
ENV NODE_ENV=production

# Install dependencies first for better caching
# Copy package files only
COPY package*.json ./

# Use npm install instead of npm ci for better compatibility
# Add timeout and retry options
RUN npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --production --silent --no-audit --no-fund

# Copy source code after dependencies are installed
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine AS production

# Install curl for health checks with timeout
RUN apk add --no-cache --timeout=300 curl

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check with longer timeout
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
