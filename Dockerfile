FROM node:20.15.0 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM node:20.15.0 AS build
ARG GIT_HASH=""
ENV GIT_HASH ${GIT_HASH}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


FROM nginx:1.26.1
WORKDIR /usr/share/nginx/html/
COPY --from=build /app/dist /usr/share/nginx/html/
EXPOSE 80
