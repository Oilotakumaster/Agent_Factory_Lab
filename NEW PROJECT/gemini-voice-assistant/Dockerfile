FROM node:20-alpine

# Set working directory
WORKDIR /app

# Avoid npm issues inside standard un-cached environments occasionally
RUN npm cache clean --force

# Copy frontend code and build it
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# Copy backend code
COPY backend ./backend
RUN cd backend && npm install

# Expose the API port
ENV API_BACKEND_PORT=8080
ENV API_BACKEND_HOST=0.0.0.0
EXPOSE 8080

# Start the application from the backend directory
WORKDIR /app/backend
CMD ["node", "server.js"]
