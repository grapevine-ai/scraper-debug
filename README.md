## Installation

### Import app

Use the package manager `npm` installed with [NodeJS](https://nodejs.org/) to install Grapevine scraper.

First clone the repository on the server: 

```bash
git clone https://address.of.this.repo
```

In the root folder, run the following command to install all the dependencies:

```bash
npm install
```

Don't forget to create the environment file `.env` in the root folder with the following variables:

```dotenv
// APP
PORT=3040
NODE_ENV=dev
LI_ADDRESS=http://localhost:3040/li.html

// PROXY (if needed)
PROXY_ADDRESS=####
PROXY_CUSTOMER=####
PROXY_ZONE=####
PROXY_PASS=####
PROXY_TOKEN=####
PROXY_IP=####
```

Start the server from the root of this repo:

```
node app.js
```

## Usage
POST nothing to `/get_list` endpoint if your `LI_ADDRESS` is localhost.
Otherwise, if you use the POST the `li_at` cookie from LinkedIn to the `/get_list` endpoint.

Example:
```
POST /get_list HTTP/1.1
Accept: application/json
Content-Length: 80
Content-Type: application/json
Host: localhost:3040

{
   "cookie": "IDUVSOV-cogfuKUGUh9VC...."
}
```


## Docker

Find the image here: 
