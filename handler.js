const serverless = require("serverless-http");
const app = require('./app'); // Import Express app without running it

exports.handler = serverless(app);