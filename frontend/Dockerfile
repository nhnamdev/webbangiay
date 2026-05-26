# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN npm install -g serve@14.2.5

COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
