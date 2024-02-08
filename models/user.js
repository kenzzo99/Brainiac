const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  courseIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // array of _id from Courses
});

// Add a course to a user
UserSchema.methods.addCourse = async function (courseID) {
  this.courseIDs.push(courseID);
  await this.save();
};

// Remove a course from a user
UserSchema.methods.removeCourse = async function (courseID) {
  this.courseIDs = this.courseIDs.filter(id => id.toString() !== courseID.toString());
  await this.save();
};

// Find a user by username
UserSchema.statics.findByUsername = async function (username) {
  return await this.findOne({ username });
};

// Change a user's password
UserSchema.methods.changePassword = async function (newPassword) {
  this.password = newPassword;
  await this.save();
};

module.exports = mongoose.model('User', UserSchema);
