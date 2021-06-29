require('module-alias/register');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const health = require("@cloudnative/health-connect");
const promBundle = require("express-prom-bundle");
const metricsMiddleware = promBundle({includeMethod: true, includePath: true});

const logger = require('@services/logger');

// Load .env environment file
dotenv.config();

// Define root path
global.appRoot = path.resolve(__dirname);

// Set not secret environment variables if not present (mostly used for Github test)
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '3040';
process.env.PROXY_ADDRESS = process.env.PROXY_ADDRESS || 'zproxy.lum-superproxy.io:22225';
process.env.PROXY_CUSTOMER = process.env.PROXY_CUSTOMER || 'grapevine';
process.env.PROXY_ZONE = process.env.PROXY_ZONE || 'linkedin_dev_env';

let healthcheck = new health.HealthChecker();

// Create Express app
const app = express();

app.set('trust proxy', true);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/health', health.LivenessEndpoint(healthcheck));

// Starts metrics from here
app.use(metricsMiddleware);

app.use(express.static('html'))

// ENDPOINT
require('@endpoints/get_list')(app);

// Start the Express server
app.listen(parseInt(process.env.PORT), () => logger.info('Server running on port ' + process.env.PORT + '!', {user: 'admin', path:'app.listen'}));
