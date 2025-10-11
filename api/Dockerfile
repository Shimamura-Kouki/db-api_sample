FROM node:20-alpine
WORKDIR /usr/src/app

# 先に npm 設定（監査/寄付オフ、peer依存をゆるめる）
RUN npm config set fund false \
 && npm config set audit false \
 && npm config set legacy-peer-deps true

# 依存だけ先にインストール（ビルドキャッシュが効く）
COPY package.json ./
RUN npm install --no-audit --no-fund --verbose

# アプリ本体
COPY knexfile.js ./
COPY src ./src

ENV TZ=Asia/Tokyo
EXPOSE 3000
