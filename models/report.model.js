import mongoose from 'mongoose';

// Define the schema for saved monthly reports.
// This model supports the Computed Design Pattern used by the report endpoint.
const reportSchema = new mongoose.Schema({
  // User custom ID.
  userid: {
    type: Number,
    required: true
  },

  // Report year.
  year: {
    type: Number,
    required: true
  },

  // Report month.
  month: {
    type: Number,
    required: true
  },

  // Report costs grouped by categories.
  costs: {
    type: Array,
    required: true
  },

  // Date and time when the report was created.
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate saved reports for the same user, year, and month.
reportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

export default Report;