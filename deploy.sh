#!/bin/bash

cp .env .env.deploy
echo $'\nNETWORK='$1 >> .env.deploy

docker-compose -f docker-compose.yml -f docker-compose.deploy.yml --env-file .env.deploy up --build

rm .env.deploy