# 使用輕量級的 Node.js 映像檔
FROM node:18-alpine

# 設定工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json (若有)
COPY package*.json ./

# 安裝相依套件
RUN npm install --production

# 複製所有程式碼到容器內
COPY . .

# 暴露 8080 port (Cloud Run 預設)
EXPOSE 8080

# 啟動伺服器
CMD [ "npm", "start" ]
