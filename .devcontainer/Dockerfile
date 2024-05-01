FROM node:20.12.1-slim
RUN apt-get update && apt-get install -y openssl procps
WORKDIR /home/app
CMD ["./.devcontainer/start-dev.sh"]