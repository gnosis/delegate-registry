FROM node:12

ENV USER=root
WORKDIR "/"

COPY package.json yarn.lock truffle-config.js networks.json ./

RUN yarn

COPY . .

RUN yarn compile