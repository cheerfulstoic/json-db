WORKDIR /build

build:
  FROM node:14.15.5-alpine3.13
  RUN node -v
  RUN yarn -v

  COPY package.json ./
  COPY yarn.lock ./
  RUN yarn

  COPY . .
  RUN yarn build

  SAVE ARTIFACT dist

update:
  FROM alpine:latest

  COPY --dir +build/dist ./

  RUN apk add --update ssh rsync

  RUN rsync dist/* dh_s8gkcw@deerhorn.dreamhost.com:~/json-db.brian-underwood.codes/

