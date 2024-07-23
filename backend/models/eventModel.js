// backend/models/eventModel.js

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
  logoGIFKey: { type: String },
  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  difficulty: { type: Number, required: true, min: 1, max: 5 },
  entryFee: { type: Number, required: true },
  isSpecial: { type: Boolean, default: false }
}, { discriminatorKey: 'eventType' });

eventSchema.methods.isOpened = function () {
  const now = new Date();
  return now >= this.startingDate && now <= this.eventEndDate;
};

eventSchema.methods.isClosed = function () {
  const now = new Date();
  return now > this.eventEndDate;
};

const Event = mongoose.model('Event', eventSchema);

const quizEventSchema = new Schema({
  numberOfQuestions: { type: Number, required: true },
  difficulty: { type: Number, required: true, min: 1, max: 5 },
  timeLimit: { type: Number, required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
  }]
});

const QuizEvent = Event.discriminator('quiz', quizEventSchema);

const photographyEventSchema = new Schema({
  maxPhotos: { type: Number, required: true },
  themes: [{ type: String, required: true }],
  photoSubmissionDeadline: { type: Date, required: true },
  photos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }],
  maxImagesPerUser: { type: Number, required: true },
  maxLikesPerUser: { type: Number, required: true },
  difficulty: { type: Number, required: true, min: 1, max: 5 },
});

// photographyEventSchema.methods.isSubmissionStarted = function () {
//   const now = new Date();
//   return now >= this.photoSubmissionDeadline;
// };

photographyEventSchema.methods.isUploadAllowed = async function (userId) {
  const photos = await mongoose.model('Photo').countDocuments({ uploadedBy: userId, event: this._id });
  return photos < this.maxImagesPerUser;
};

photographyEventSchema.methods.isLikeAllowed = async function (userId) {
  const likes = await mongoose.model('Photo').countDocuments({ likes: userId, event: this._id });
  return likes < this.maxLikesPerUser;
};

// New helper methods for additional criteria
photographyEventSchema.methods.isUploadPeriod = function () {
  const now = new Date();
  return now >= this.startingDate && now <= this.photoSubmissionDeadline;
};

photographyEventSchema.methods.isViewingAllowed = function () {
  const now = new Date();
  return now > this.photoSubmissionDeadline;
};

const PhotographyEvent = Event.discriminator('photography', photographyEventSchema);

module.exports = { Event, QuizEvent, PhotographyEvent };
