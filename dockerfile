#Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

#Production stage
FROM node:16-alpine AS production

ARG HOST
ENV HOST=${HOST}

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

RUN mkdir -p /app/logs && chmod 777 /app/logs

VOLUME ["/app/logs"]

EXPOSE 3001

CMD ["node", "dist/src/index.js"]