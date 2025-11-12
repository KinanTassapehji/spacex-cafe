# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies using the lockfile
COPY package*.json ./
RUN npm ci

# Copy the rest of the client source and build it
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Serve the build output with Nginx
FROM nginx:1.25-alpine

# Copy the production build from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Provide a minimal Nginx configuration tuned for React single-page apps
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]