FROM node:20.12.1-slim AS build
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /home/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn prisma generate
RUN yarn build


FROM node:20.12.1-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /home/app
COPY --from=build /home/app/dist ./dist
COPY --from=build /home/app/prisma ./prisma
COPY --from=build /home/app/package.json ./
COPY --from=build /home/app/.env.example ./.env
COPY --from=build /home/app/node_modules ./node_modules
CMD ["yarn", "start:prod"]
