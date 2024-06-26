// backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // Added username
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  age: { type: Number, required: true }, // Added age
  roles: [{ type: String, enum: ['user', 'admin'], default: 'user' }], // Array of roles
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], // Array of event IDs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

module.exports = mongoose.model('User', userSchema);
