FROM node:20.12.1-slim AS base

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package.json ./

EXPOSE 3000

# Development #

FROM base AS development

CMD ["/app/.docker/start-dev.sh"]

