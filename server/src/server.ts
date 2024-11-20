import express, { Application } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/database';
import cors from 'cors';

// Initialize dotenv
dotenv.config();

const app: Application = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Define routes (Add more routes as you create controllers)
app.get('/', (req, res) => {
  res.send('Sports Events Booking API');
});

// Start server
const PORT = process.env.PORT!;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
