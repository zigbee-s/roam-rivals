// File: server.js

const express = require('express');
const connectDB = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const photoRoutes = require('./routes/photoRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes')
const rateLimit = require('express-rate-limit');
const expressWinston = require('express-winston');
const winston = require('winston');
const logger = require('./logger');
const middlewares = require('./middlewares/middlewares'); // Import the common middlewares

const app = express();

// Apply common middlewares
app.use(middlewares);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,  // 100 requests
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Request logging middleware (commented out)
// app.use(expressWinston.logger({
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'logs/request.log' })
//   ],
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.json()
//   ),
//   meta: true,
//   msg: "HTTP {{req.method}} {{req.url}}",
//   expressFormat: true,
//   colorize: false,
//   ignoreRoute: function (req, res) { return false; }
// }));

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/events', eventRoutes);
app.use('/photos', photoRoutes);
app.use('/leaderboard', leaderboardRoutes)


// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message
  });
});

// Connect to MongoDB and start server
(async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
})();
