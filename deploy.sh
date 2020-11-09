#!/bin/bash

cp .env .env.deploy
echo $'\nNETWORK='$1 >> .env.deploy

docker-compose -f docker-compose.yml -f docker-compose.deploy.yml --env-file .env.deploy up --build

node scripts/clean_build.js
node scripts/generate_meta.js --upload
yarn truffle exec scripts/verify_deployment.js --network=$1

rm .env.deploy
