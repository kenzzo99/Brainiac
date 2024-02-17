const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  courseID: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonID: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true},
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  performance: { type: Number, default: 0 },
  // Add any additional fields as necessary
});

module.exports = mongoose.model('Quiz', QuizSchema);
