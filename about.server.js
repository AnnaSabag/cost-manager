import express from 'express';
import dotenv from 'dotenv';
import connectToDatabase from './utils/database.js';
import requestLogger from './utils/requestLogger.js';

// Load environment variables from the .env file.
dotenv.config();

// Create the Express application for the about process.
const app = express();

// Use the about service port from .env, or 3004 as a default local port.
const PORT = process.env.PORT || process.env.ABOUT_PORT || 3004;

// Enable the server to read JSON request bodies.
app.use(express.json());

// Save a log record for every HTTP request handled by this service.
app.use(requestLogger);

// Basic route to check if the about service is running.
app.get('/', (req, res) => {
  res.send('About service is running');
});

// ==================================================
// Get developers team details
// ==================================================

app.get('/api/about', (req, res) => {
  try {
    /*
      The project requires the developers team details to be returned
      without storing them in the database. Therefore, the team members
      are hardcoded in this service and only first_name and last_name
      are returned in the response.
    */
    const teamMembers = [
      {
        first_name: 'anna',
        last_name: 'sabag'
      },
      {
        first_name: 'Aviv',
        last_name: 'Mizrahi'
      }
    ];

    // Return only the developers first and last names.
    return res.status(200).json(teamMembers);
  } catch (error) {
    // Return a standard JSON error response.
    return res.status(500).json({
      id: 'server_error',
      message: error.message
    });
  }
});

// Connect to MongoDB Atlas and start the about service only after a successful connection.
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`About service running on port ${PORT}`);
  });
});