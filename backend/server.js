const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/submit-form', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Name: ${name}, Email: ${email}, Message: ${message}`);
  res.send(`Form submitted! Name: ${name}, Email: ${email}, Message: ${message}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
