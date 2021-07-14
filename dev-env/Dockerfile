FROM zenika/alpine-chrome:86-with-puppeteer
USER root
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create app directory
WORKDIR /usr/src/scraper

# Install nodemon
RUN npm install -g nodemon

EXPOSE 3040
CMD [ "nodemon", "--inspect=0.0.0.0",  "app.js" ]