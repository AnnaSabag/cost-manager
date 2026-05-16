import pino from 'pino';
import Log from '../models/log.model.js';

// Create a Pino logger instance for console log messages.
const logger = pino();

// Middleware that logs every HTTP request and saves it to MongoDB.
const requestLogger = async (req, res, next) => {
  try {
    // Write the request method and URL to the console using Pino.
    logger.info(`${req.method} ${req.originalUrl}`);

    // Save the request details in the logs collection.
    await Log.create({
      method: req.method,
      url: req.originalUrl,
      message: 'HTTP request received'
    });
  } catch (error) {
    // Log the error without blocking the request flow.
    logger.error(error.message);
  }

  // Continue to the next middleware or route handler.
  next();
};

export default requestLogger;