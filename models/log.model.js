import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  // HTTP method used in the request.
  method: {
    type: String,
    required: true
  },

  // Requested URL.
  url: {
    type: String,
    required: true
  },

  // Log message.
  message: {
    type: String,
    required: true
  },

  // Date and time when the log was created.
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Log = mongoose.model('Log', logSchema);

export default Log;