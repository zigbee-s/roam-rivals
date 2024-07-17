//middlewares/middleware.js
const cors = require('cors');
const helmet = require('helmet');
const express = require('express');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;
