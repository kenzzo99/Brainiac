const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  courseID: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  // Add additional fields as necessary
});

module.exports = mongoose.model('Lesson', LessonSchema);