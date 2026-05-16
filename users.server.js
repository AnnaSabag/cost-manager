import express from 'express';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Cost from './models/cost.model.js';
import connectToDatabase from './utils/database.js';
import requestLogger from './utils/requestLogger.js';

// Load environment variables from the .env file.
dotenv.config();

// Create the Express application for the users process.
const app = express();

// Use the users service port from .env, or 3001 as a default local port.
const PORT = process.env.PORT || process.env.USERS_PORT || 3001;

// Enable the server to read JSON request bodies.
app.use(express.json());

// Save a log record for every HTTP request handled by this service.
app.use(requestLogger);

// Basic route to check if the users service is running.
app.get('/', (req, res) => {
  res.send('Users service is running');
});

// ==================================================
// Add a new user
// ==================================================

app.post('/api/add', async (req, res) => {
  try {
    // Extract the user fields from the request body.
    const { id, first_name, last_name, birthday } = req.body;

    // Validate that all required user fields were provided.
    if (!id || !first_name || !last_name || !birthday) {
      return res.status(400).json({
        id: 'missing_fields',
        message: 'id, first_name, last_name, and birthday are required'
      });
    }

    // Validate that the custom user id is a number.
    if (typeof id !== 'number') {
      return res.status(400).json({
        id: 'invalid_id',
        message: 'id must be a number'
      });
    }

    // Search the users collection by the custom id field, not by MongoDB _id.
    const existingUser = await User.findOne({ id });

    // Prevent creating more than one document for the same user.
    if (existingUser) {
      return res.status(400).json({
        id: 'user_exists',
        message: 'User already exists'
      });
    }

    // Create a new user document according to the users schema.
    const user = new User({
      id,
      first_name,
      last_name,
      birthday
    });

    // Save the new user document in MongoDB.
    const savedUser = await user.save();

    // Return the created user as JSON.
    return res.status(201).json(savedUser);
  } catch (error) {
    // Return a standard JSON error response.
    return res.status(500).json({
      id: 'server_error',
      message: error.message
    });
  }
});

// ==================================================
// Get all users
// ==================================================

app.get('/api/users', async (req, res) => {
  try {
    // Find all user documents in the users collection.
    const users = await User.find();

    // Return the users list as JSON.
    return res.status(200).json(users);
  } catch (error) {
    // Return a standard JSON error response.
    return res.status(500).json({
      id: 'server_error',
      message: error.message
    });
  }
});

// ==================================================
// Get user details by custom user ID
// ==================================================

app.get('/api/users/:id', async (req, res) => {
  try {
    // Convert the route parameter into a number.
    const userId = Number(req.params.id);

    // Validate that the user id from the URL is numeric.
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        id: 'invalid_id',
        message: 'id must be a number'
      });
    }

    // Find the user by the custom id field.
    const user = await User.findOne({ id: userId });

    // Return an error when the requested user does not exist.
    if (!user) {
      return res.status(404).json({
        id: 'user_not_found',
        message: 'User was not found'
      });
    }

    /*
      Calculate the total costs of the specific user.
      The costs collection stores the user reference in the userid field,
      while the users collection stores the custom user identifier in the id field.
      The aggregation groups all matching cost items and sums their sum values.
    */
    const result = await Cost.aggregate([
      {
        $match: {
          userid: userId
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$sum'
          }
        }
      }
    ]);

    // If the user has no cost items, the total should be zero.
    const total = result.length > 0 ? result[0].total : 0;

    // Return only the properties required by the project document.
    return res.status(200).json({
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
      total
    });
  } catch (error) {
    // Return a standard JSON error response.
    return res.status(500).json({
      id: 'server_error',
      message: error.message
    });
  }
});

// Connect to MongoDB Atlas and start the users service only after a successful connection.
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Users service running on port ${PORT}`);
  });
});