FROM node:9.10.0-alpine

LABEL description "A Bot core brain for Bot Brain Architecture."
LABEL author "Kevin Nakasar Thizy"

# Create app directory
WORDIR /usr/src/botbrain

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
