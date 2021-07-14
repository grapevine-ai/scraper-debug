FROM zenika/alpine-chrome:89-with-puppeteer
USER root
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create app directory
WORKDIR /usr/src/scraper

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production
# If you are building your code for development
# RUN npm install

# Bundle app source
COPY . .

EXPOSE 3040
CMD [ "node", "app.js" ]


