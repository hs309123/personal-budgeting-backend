const serverlessExpress = require('@vendia/serverless-express');
const app = require('./app'); // Import Express app without running it

exports.handler = serverlessExpress({ app });