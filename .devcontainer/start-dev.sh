#!/bin/bash

yarn install
yarn migration-dev

if [ ! -f ".env" ]; then
  cp .env.example .env
fi


tail -f /dev/null