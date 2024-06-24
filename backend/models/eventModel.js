// backend/models/eventModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true, enum: ['general', 'quiz', 'photography'] },
}, { discriminatorKey: 'eventType' });

const Event = mongoose.model('Event', eventSchema);

// Quiz Event Schema
const quizEventSchema = new Schema({
  numberOfQuestions: { type: Number, required: true },
  difficulty: { type: String, required: true },
  timeLimit: { type: Number, required: true }, // Time in minutes
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
  }]
});

const QuizEvent = Event.discriminator('quiz', quizEventSchema);

// Photography Event Schema
const photographyEventSchema = new Schema({
  maxPhotos: { type: Number, required: true },
  themes: [{ type: String, required: true }],
  submissionDeadline: { type: Date, required: true },
});

const PhotographyEvent = Event.discriminator('photography', photographyEventSchema);

module.exports = { Event, QuizEvent, PhotographyEvent };
