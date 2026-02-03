# Stage 1: Build the Angular application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source
COPY . .

# Build the application for production
RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built application from the build stage
COPY --from=build /app/dist/anonymization-frontend/browser /usr/share/nginx/html

# Copy a simple Nginx configuration to handle client-side routing and API proxying
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass https://anonymizer.go-data.at; \
        proxy_ssl_server_name on; \
        proxy_set_header Host anonymizer.go-data.at; \
    } \
    location /soya-api/ { \
        rewrite ^/soya-api/(.*) /api/v1/$1 break; \
        proxy_pass https://soya-web-cli.ownyourdata.eu; \
        proxy_ssl_server_name on; \
        proxy_set_header Host soya-web-cli.ownyourdata.eu; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
