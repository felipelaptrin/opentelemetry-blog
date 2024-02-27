FROM node:20-alpine as build

WORKDIR /app
COPY package.json ./
RUN yarn
COPY . .
RUN yarn build


FROM node:20-alpine as runner

WORKDIR /app
COPY package.json ./
RUN yarn --prod
COPY --from=build /app/dist ./
EXPOSE 8000
CMD ["node", "index.js"]
