FROM zenika/alpine-chrome:86-with-puppeteer
USER root
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create app directory
WORKDIR /usr/src/scraper

## Install app dependencies
## A wildcard is used to ensure both package.json AND package-lock.json are copied
## where available (npm@5+)
#COPY package*.json ./
#
##RUN npm ci --only=production
## If you are building your code for development
#RUN npm install
#
## Bundle app source
#COPY . .

# Install nodemon
RUN npm install -g nodemon

EXPOSE 3040
CMD [ "nodemon", "--inspect=0.0.0.0",  "app.js" ]
