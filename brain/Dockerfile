FROM node:6.10.2-alpine

LABEL description "A Bot core brain for Bot Brain Architecture."
LABEL author "Kevin Nakasar Thizy"

RUN apk update && apk upgrade \
 && apk add --no-cache git \
 && apk add --no-cache tzdata

COPY dasboard/ dashboard/
COPY database/ database
COPY logic/ logic/
COPY brain.js brain.js
COPY package-lock.json package-lock.json
COPY package.json package.json
COPY router.js router.js

RUN npm install
CMD npm start
