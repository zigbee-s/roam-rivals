const app = require('./middlewares/middlewares');
const { connectDB } = require('./db/db');
const userRoutes = require('./routes/userRoutes');
const { PORT } = require('./config/config');

app.use('/', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
})();
