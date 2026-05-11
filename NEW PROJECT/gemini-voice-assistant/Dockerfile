FROM node:20-slim AS builder

WORKDIR /app
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Setup backend
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
RUN npm install --production

# 雲端執行環境變數會由 Cloud Run 提供
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
