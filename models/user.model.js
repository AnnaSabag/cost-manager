import mongoose from 'mongoose';

// Define the schema for documents in the users collection.
const userSchema = new mongoose.Schema({
  // Custom user ID required by the project. This is different from MongoDB _id.
  id: {
    type: Number,
    required: true,
    unique: true
  },

  // User first name.
  first_name: {
    type: String,
    required: true
  },

  // User last name.
  last_name: {
    type: String,
    required: true
  },

  // User birthday.
  birthday: {
    type: Date,
    required: true
  }
});

// Map the User model to the users collection.
const User = mongoose.model('User', userSchema);

export default User;