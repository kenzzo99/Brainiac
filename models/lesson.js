const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  courseID: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  assistantThread: { type: String},
  quizID: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  // Add additional fields as necessary
});

// Add a method to add a quiz to a lesson
LessonSchema.methods.addQuiz = async function (quizID) {
  this.quizID = quizID;
  await this.save();
};
module.exports = mongoose.model('Lesson', LessonSchema);