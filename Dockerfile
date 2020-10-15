FROM node:12

ENV USER=root
WORKDIR "/"

COPY package.json ./
COPY yarn.lock ./
COPY truffle-config.js ./
COPY networks.json ./

RUN yarn

COPY . .

RUN yarn compile