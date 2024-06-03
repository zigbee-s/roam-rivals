// controllers/userController.js
const { client } = require('../db/db');

async function addUser(req, res) {
  const { name, email, message } = req.body;
  console.log(`Name: ${name}, Email: ${email}, Message: ${message}`);

  try {
    const collection = client.db('test').collection('users');
    await collection.insertOne({ name, email, message });
    console.log(`User added! Name: ${name}, Email: ${email}, Message: ${message}`);
    res.send(`User added! Name: ${name}, Email: ${email}, Message: ${message}`);
  } catch (error) {
    console.error('Error adding user', error);
    res.status(500).send('Error adding user');
  }
}

module.exports = { addUser };
