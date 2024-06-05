const User = require('../models/userModel');
const IdempotencyKey = require('../models/idempotencyKeyModel');
const { delay } = require('../helpers/delayHelper');

const userController = {};

userController.addUser = async (req, res) => {
  const idempotencyKeyEntry = req.idempotencyKeyEntry;

  try {
    // Simulate a delay if needed
    console.log("UserController triggered")
    await delay(30000); // 60,000 milliseconds = 1 minute
    
    // Create a new user instance based on request data
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message
    });

    // Save the user to the database
    await newUser.save();

    // Prepare the response body
    const responseBody = { message: 'User added successfully', user: newUser };

    // Update the idempotency key entry with response data and status
    await IdempotencyKey.findByIdAndUpdate(
      idempotencyKeyEntry._id,
      { responseBody, status: 'completed' },
      { new: true }
    );

    res.status(200).json(responseBody);
  } catch (error) {
    const responseBody = { error: 'Internal Server Error', details: error.message };

    await IdempotencyKey.findByIdAndUpdate(
      idempotencyKeyEntry._id,
      { responseBody, status: 'failed' },
      { new: true }
    );

    console.error('Error adding user:', error);
    res.status(500).json(responseBody);
  }
};

module.exports = userController;
