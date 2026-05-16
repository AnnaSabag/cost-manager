import mongoose from 'mongoose';

// Connect to MongoDB Atlas using the connection string from the .env file.
const connectToDatabase = async () => {
  try {
    // Open a Mongoose connection before starting the service.
    await mongoose.connect(process.env.MONGO_URI);

    // Print a success message when the database connection is ready.
    console.log('MongoDB Connected');
  } catch (error) {
    // Print the connection error for debugging.
    console.log('DB Connection Error:', error);

    // Stop the current process when the database connection fails.
    process.exit(1);
  }
};

export default connectToDatabase;