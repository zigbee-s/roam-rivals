require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbClient;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/submit-form', async (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Name: ${name}, Email: ${email}, Message: ${message}`);

  try {
    const collection = dbClient.db('test').collection('testdb');
    await collection.insertOne({ name, email, message });
    res.send(`Form submitted! Name: ${name}, Email: ${email}, Message: ${message}`);
  } catch (error) {
    console.error('Error inserting document', error);
    res.status(500).send('Error submitting form');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

(async () => {
  try {
    dbClient = await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
})();
