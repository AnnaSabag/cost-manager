import express from 'express';
import dotenv from 'dotenv';
import Log from './models/log.model.js';
import connectToDatabase from './utils/database.js';
import requestLogger from './utils/requestLogger.js';

// Load environment variables from the .env file.
dotenv.config();

// Create the Express application for the logs process.
const app = express();

// Use the logs service port from .env, or 3003 as a default local port.
const PORT = process.env.PORT || process.env.LOGS_PORT || 3003;

// Enable the server to read JSON request bodies.
app.use(express.json());

// Save a log record for every HTTP request handled by this service.
app.use(requestLogger);

// Basic route to check if the logs service is running.
app.get('/', (req, res) => {
  res.send('Logs service is running');
});

// ==================================================
// Get all logs
// ==================================================

app.get('/api/logs', async (req, res) => {
  try {
    // Find all log documents in the logs collection.
    const logs = await Log.find();

    // Return the logs list as JSON.
    return res.status(200).json(logs);
  } catch (error) {
    // Return a standard JSON error response.
    return res.status(500).json({
      id: 'server_error',
      message: error.message
    });
  }
});

// Connect to MongoDB Atlas and start the logs service only after a successful connection.
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Logs service running on port ${PORT}`);
  });
});