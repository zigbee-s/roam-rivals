// backend/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const photoRoutes = require('./modules/photography/routes/photoRoutes');  // Ensure this line is present
const rateLimit = require('express-rate-limit');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,  // 100 requests
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/events', eventRoutes);
app.use('/photos', photoRoutes);  // Ensure this line is present

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Connect to MongoDB and start server
(async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
})();
