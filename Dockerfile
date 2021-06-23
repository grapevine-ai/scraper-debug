FROM zenika/alpine-chrome:89-with-node
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

# Generate doc
RUN node_modules/apidoc/bin/apidoc -i . -e node_modules/ -e apidoc/ -o apidoc/

EXPOSE 3040
CMD [ "node", "app.js" ]














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

# Generate doc
RUN node_modules/apidoc/bin/apidoc -i . -e node_modules/ -e apidoc/ -o apidoc/

EXPOSE 3040
CMD [ "node", "app.js" ]
