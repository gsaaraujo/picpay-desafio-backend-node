#!/bin/bash

yarn install

npx prisma migrate dev

tail -f /dev/null