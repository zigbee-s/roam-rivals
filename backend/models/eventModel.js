const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startingDate: { type: Date, required: true },
  eventEndDate: { type: Date, required: true },
  location: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventType: { type: String, required: true, enum: ['general', 'quiz', 'photography'] },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { discriminatorKey: 'eventType' });

// General event status methods
eventSchema.methods.isOpened = function () {
  const now = new Date();
  return now >= this.startingDate && now <= this.eventEndDate;
};

eventSchema.methods.isClosed = function () {
  const now = new Date();
  return now > this.eventEndDate;
};

const Event = mongoose.model('Event', eventSchema);

// Quiz Event Schema
const quizEventSchema = new Schema({
  numberOfQuestions: { type: Number, required: true },
  difficulty: { type: String, required: true },
  timeLimit: { type: Number, required: true },
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
  themes: [{ type: String, required: true }], // Ensure themes are properly defined
  photoSubmissionDeadline: { type: Date, required: true },
  photos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }]
});

// Photography event status methods
photographyEventSchema.methods.isSubmissionStarted = function () {
  const now = new Date();
  return now >= this.photoSubmissionDeadline;
};

const PhotographyEvent = Event.discriminator('photography', photographyEventSchema);

module.exports = { Event, QuizEvent, PhotographyEvent };
