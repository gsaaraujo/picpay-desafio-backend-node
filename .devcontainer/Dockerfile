FROM node:20.12.1-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /home/app
CMD ["./.devcontainer/start-dev.sh"]