#!/bin/bash

yarn install

yarn migration-dev

tail -f /dev/null