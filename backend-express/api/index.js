/**
 * Vercel Serverless Function Entry Point
 * This wraps the Express app for Vercel deployment
 */

const app = require('../server');

// Export the Express app as a serverless function
module.exports = app;
