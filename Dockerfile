FROM mhart/alpine-node:10 AS builder
WORKDIR /app
COPY package.json .
RUN yarn
COPY . ./
RUN yarn build

FROM mhart/alpine-node:10
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]