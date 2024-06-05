const app = require('./middlewares/middlewares');
const connectDB  = require('./db/db');
const userRoutes = require('./routes/userRoutes');
const { PORT } = require('./config/config');
const rateLimit = require("express-rate-limit");

// Define rate-limiting options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});

// Apply rate limiter to all requests
app.use(limiter);

app.use('/', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

(async () => {
  try {
    connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
})();
