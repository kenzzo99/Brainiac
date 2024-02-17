// MongoDB dependencies and models.
const mongoose = require("mongoose");
const User = require("./models/user"); // database schemas for mongoDB
const Course = require("./models/course");
const Lesson = require("./models/lesson");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/your_database_name",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Check for successful connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected successfully to MongoDB");
});

async function deleteAndRemoveLessons() {
  try {
    await Course.deleteMany({});
    console.log("All lessons deleted");
    await Lesson.deleteMany({});
    await Course.updateMany({}, { $set: { lessons: [] } });
    console.log("All lessons removed from all courses");
  } catch (err) {
    console.error(err);
  }
}

deleteAndRemoveLessons();