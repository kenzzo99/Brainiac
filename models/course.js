const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  assistantID: { type: String, required: true},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  title: { type: String},
  description: { type: String},
  curriculum: { type: String},
  createdAt: { type: Date, default: Date.now },
  // add GPTstudentID - AI for Feynman studying
  lessonIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  quizIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  threadID: { type: String }
  // Include other relevant fields as needed
});


// Add one or multiple lessons to a course
CourseSchema.methods.addLessons = async function (lessonIDs) {
  this.lessonIDs.push(...lessonIDs);
  await this.save();
};

// Add one or multiple quizzes to a course
CourseSchema.methods.addQuizzes = async function (quizIDs) {
  this.quizIDs.push(...quizIDs);
  await this.save();
};

// Get curriculum for a course
CourseSchema.methods.getCurriculum = async function () {
  return this.curriculum;
};


module.exports = mongoose.model('Course', CourseSchema);
