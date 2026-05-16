import express from 'express';
import dotenv from 'dotenv';
import User from './models/user.model.js';
import Cost from './models/cost.model.js';
import Report from './models/report.model.js';
import connectToDatabase from './utils/database.js';
import requestLogger from './utils/requestLogger.js';

// Load environment variables from the .env file.
dotenv.config();

// Create the Express application for the costs process.
const app = express();

// Use the costs service port from .env, or 3002 as a default local port.
const PORT = process.env.PORT || process.env.COSTS_PORT || 3002;

// Enable the server to read JSON request bodies.
app.use(express.json());

// Save a log record for every HTTP request handled by this service.
app.use(requestLogger);

// Basic route to check if the costs service is running.
app.get('/', (req, res) => {
  res.send('Costs service is running');
});

// ==================================================
// Add a new cost item
// ==================================================

app.post('/api/add', async (req, res) => {
  try {
    // Extract the cost item fields from the request body.
    const { userid, description, category, sum, date } = req.body;

    // Define the categories supported by the project requirements.
    const allowedCategories = ['food', 'health', 'housing', 'sports', 'education'];

    // Validate that all required cost fields were provided.
    if (userid === undefined || !description || !category || sum === undefined) {
      return res.status(400).json({
        id: 'missing_fields',
        message: 'userid, description, category, and sum are required'
      });
    }

    // Validate that the user id is numeric.
    if (typeof userid !== 'number') {
      return res.status(400).json({
        id: 'invalid_userid',
        message: 'userid must be a number'
      });
    }

    // Validate that the category is one of the supported lowercase categories.
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        id: 'invalid_category',
        message: 'category must be one of: food, health, housing, sports, education'
      });
    }

    // Validate that the cost sum is a positive number.
    if (typeof sum !== 'number' || sum <= 0) {
      return res.status(400).json({
        id: 'invalid_sum',
        message: 'sum must be a positive number'
      });
    }

    // Check if the user exists before adding a cost item.
    const existingUser = await User.findOne({ id: userid });

    // Return an error when the cost item belongs to a user that does not exist.
    if (!existingUser) {
      return res.status(404).json({
        id: 'user_not_found',
        message: 'User was not found'
      });
    }

    // Use the provided date, or the current request date and time when no date is provided.
    const costDate = date ? new Date(date) : new Date();

    // Validate that the date value can be converted into a valid Date object.
    if (Number.isNaN(costDate.getTime())) {
      return res.status(400).json({
        id: 'invalid_date',
        message: 'date must be a valid date'
      });
    }

    // Prevent adding costs with dates that belong to the past when a date is explicitly provided.
    const now = new Date();

    if (costDate < now && date) {
      return res.status(400).json({
        id: 'past_date_not_allowed',
        message: 'Adding costs with dates that belong to the past is not allowed'
      });
    }

    // Create a new cost item document according to the costs schema.
    const cost = new Cost({
      userid,
      description,
      category,
      sum,
      date: costDate
    });

    // Save the new cost item in MongoDB.
    const savedCost = await cost.save();

    // Return the created cost item as JSON.
    return res.status(201).json(savedCost);
  } catch (error) {
    // Return a standard JSON error response.
    return res.status(500).json({
      id: 'server_error',
      message: error.message
    });
  }
});

// ==================================================
// Get monthly report for a specific user
// ==================================================

app.get('/api/report', async (req, res) => {
  try {
    // Convert query string values into numbers.
    const userId = Number(req.query.id);
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    // Validate that all required query parameters were provided.
    if (!req.query.id || !req.query.year || !req.query.month) {
      return res.status(400).json({
        id: 'missing_fields',
        message: 'id, year, and month are required'
      });
    }

    // Validate that all query parameters are numeric.
    if (Number.isNaN(userId) || Number.isNaN(year) || Number.isNaN(month)) {
      return res.status(400).json({
        id: 'invalid_parameters',
        message: 'id, year, and month must be numbers'
      });
    }

    // Validate that the requested month is in the valid calendar range.
    if (month < 1 || month > 12) {
      return res.status(400).json({
        id: 'invalid_month',
        message: 'month must be between 1 and 12'
      });
    }

    // Check if the requested user exists before creating the report.
    const existingUser = await User.findOne({ id: userId });

    // Return an error when the requested user does not exist.
    if (!existingUser) {
      return res.status(404).json({
        id: 'user_not_found',
        message: 'User was not found'
      });
    }

    // Build date values that help determine whether the requested report is for a past month.
    const now = new Date();
    const requestedMonthDate = new Date(year, month - 1, 1);
    const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

    // A report is considered computed and reusable only when the requested month already passed.
    const isPastMonth = requestedMonthDate < currentMonthDate;

    /*
      Computed Design Pattern implementation:
      When a monthly report is requested for a month that has already passed,
      the service first checks whether a computed report already exists in
      the reports collection. If it exists, the saved report is returned.
      If it does not exist, the report is calculated from the costs collection
      and then saved for future requests.

      This reduces repeated calculations for old months. Current and future
      months are calculated dynamically because their data may still change.
    */

    // Return a saved report when the requested month has already passed.
    if (isPastMonth) {
      const savedReport = await Report.findOne({
        userid: userId,
        year,
        month
      });

      // If a computed report already exists, return it without recalculating.
      if (savedReport) {
        return res.status(200).json({
          userid: savedReport.userid,
          year: savedReport.year,
          month: savedReport.month,
          costs: savedReport.costs
        });
      }
    }

    // Define the first day of the requested month and the first day of the next month.
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Find all cost items for the requested user, year, and month.
    const costItems = await Cost.find({
      userid: userId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    // Keep all required categories in the report, even when a category has no cost items.
    const categories = ['food', 'education', 'health', 'housing', 'sports'];

    // Build the report costs array according to the exact structure required by the project.
    const groupedCosts = categories.map((categoryName) => {
      // Select only cost items that belong to the current category.
      const costsForCategory = costItems
        .filter((costItem) => costItem.category === categoryName)
        .map((costItem) => ({
          sum: costItem.sum,
          description: costItem.description,
          day: costItem.date.getDate()
        }));

      // Return an object where the category name is the key and the value is an array of costs.
      return {
        [categoryName]: costsForCategory
      };
    });

    // Create the final monthly report object.
    const reportData = {
      userid: userId,
      year,
      month,
      costs: groupedCosts
    };

    // Save the computed report only for months that already passed.
    if (isPastMonth) {
      const report = new Report(reportData);
      await report.save();
    }

    // Return the monthly report as JSON.
    return res.status(200).json(reportData);
  } catch (error) {
    // Return a standard JSON error response.
    return res.status(500).json({
      id: 'server_error',
      message: error.message
    });
  }
});

// Connect to MongoDB Atlas and start the costs service only after a successful connection.
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Costs service running on port ${PORT}`);
  });
});