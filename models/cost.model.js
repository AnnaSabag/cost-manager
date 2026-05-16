import mongoose from 'mongoose';

const costSchema = new mongoose.Schema({
  // Cost item description.
  description: {
    type: String,
    required: true
  },

  // Cost category.
  category: {
    type: String,
    required: true,
    enum: ['food', 'health', 'housing', 'sports', 'education']
  },

  // User custom ID. This should match the id field in the users collection.
  userid: {
    type: Number,
    required: true
  },

  // Cost amount. JavaScript Number supports decimal values.
  sum: {
    type: Number,
    required: true
  },

  // Date and time when the cost item was created.
  date: {
    type: Date,
    default: Date.now
  }
});

const Cost = mongoose.model('Cost', costSchema);

export default Cost;