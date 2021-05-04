FROM node:lts-alpine

RUN adduser -D mecoin

USER mecoin

WORKDIR /home/mecoin

COPY yarn.lock .

RUN yarn

COPY . .

CMD node src/index.js

EXPOSE ${PORT:-3000}
