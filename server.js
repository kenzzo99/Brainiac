// server.js

// Module Dependencies
const express = require("express");
const gptService = require("./gptService");
const cors = require("cors");
const uploadRouter = require("./routes/upload");
const axios = require("axios");

// MongoDB dependencies and models.
const mongoose = require("mongoose");
const User = require("./models/user"); // database schemas for mongoDB
const Lesson = require("./models/lesson");
const Course = require("./models/course");
const Quiz = require("./models/quiz");
const fs = require("fs");

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

// Express app setup
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON parsing for all routes
let assistant; // Global variable to store the assistant ID

app.use("/upload", uploadRouter);

/**
 * Route for generating materials based on the provided curriculum. The curriculum is processed
 * by the gptService and materials are generated for each lesson. The generated materials are
 * returned in the response.
 * 65c457422e035ca9725ad40e
 *
 * @name post/generateMaterials
 * @function
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @param {function} callback - The callback function to execute for this route.
 */

app.post("/generateSummary", async (req, res) => {
  // get the userID from the request
  const userID = req.body.userID;

  // get the courseID from the request
  const courseID = req.body.courseID;
  console.log("Course ID: ", courseID);
  // get the lessonTitle from the request
  const lessonTitle = req.body.lessonTitle;
  console.log("Lesson Name: ", lessonTitle);
  // get assistantID from courseID
  const course = await Course.findById(courseID);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  const assistantID = course.assistantID;
  console.log("Assistant ID: ", assistantID);
  const threadID = course.threadID;
  console.log("We are here");
  // Generate the summary for the given lesson
  let newLesson = await gptService.generate_summary(assistantID, lessonTitle, threadID);
  res.json(newLesson);
});

app.post("/generateCurriculum", async (req, res) => {
  // get the userID from the request
  const userID = req.body.userID;

  // get the assistantID from the request
  const courseID = req.body.courseID;

  // find the course by id
  const course = await Course.findById(courseID);

  // get assistant id from the course
  const assistantID = course.assistantID;
  // Generate the curriculum (returns a JSON object of curriculum)
  let result = await gptService.generate_curriculum(assistantID);
  let curriculum = result.curriculum;
  let threadID = result.threadID;
  // Store the curriculum for the course
  course.curriculum = JSON.stringify(curriculum);
  // Store the thread for the course
  course.threadID = threadID;
  await course.save();
  // return the curriculum
  res.json(curriculum);
});

app.post("/generateMaterials", async (req, res) => {
  // get the userID from the request
  const userID = req.body.userID;

  // get the assistantID from the request
  const assistantID = req.body.assistantID;

  // Find the course in the database by assitantID
  const course = await Course.findOne({ assistantID: assistantID });
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Generate the curriculum (returns a JSON object of curriculum)
  let curriculum,
    thread = await gptService.generate_curriculum(assistantID);
  // console.log(JSON.stringify(curriculum));
  // Store the curriculum for the course
  course.curriculum = curriculum;
  await course.save();

  // Generate a topic intro and summary of curriculum PDF
  let intro = gptService.generate_intro(assistantID, thread);
  // Save intro as course description
  course.description = intro;
  await course.save();

  let summaries = gptService.generate_summaries(
    assistantID,
    curriculum,
    thread
  );

  // Create new Course db entry using curriculum and summaries
  // const newCourse = new Course({
  //     title: "Test Course",
  //     curriculum: curriculum,
  //     intro: intro,
  //     summaries: summaries
  // });
  // newCourse.save().then((result) => {
  //     console.log(result);
  // }).catch((err) => {
  //     console.log(err);
  // });
  res.json("Materials generated");

  // JSON format quiz with multiple choice questions and correct answers
});

// Route for fetching the curriculum for a course
app.get("/api/curriculum/:courseID", async (req, res) => {
  try {
    const courseID = req.params.courseID;
    const course = await Course.findById(courseID);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.send(course.curriculum);
  } catch (error) {
    console.error("Error retrieving curriculum:", error);
    res.status(500).send("Error retrieving curriculum");
  }
});

// Route for fetching the summary for a lesson
app.get("/api/summary/:courseID/:lessonTitle", async (req, res) => {
  try {
    const courseID = req.params.courseID;
    const lessonTitle = req.params.lessonTitle;
    console.log("Course ID: ", courseID);
    console.log("Lesson Title: ", req.params.lessonTitle);
    let lesson = await Lesson.findOne({
      courseID: courseID,
      title: lessonTitle,
    });
    if (!lesson) {
      // Call the generateSummary route
      const summaryResponse = await axios.post(
        `http://localhost:5000/generateSummary`,
        {
          courseID: courseID,
          lessonTitle: lessonTitle,
        }
      );
      console.log("Summary Response: ", summaryResponse);
      lesson = summaryResponse.data.content;
      lesson = await gptService.save_to_pdf(lesson, lessonTitle); // returns path to file
      res.status(200).sendFile(lesson);
      // Wait 4 seconds
      setTimeout(() => {
        fs.unlink(lesson, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File deleted successfully");
          }
        });
      }, 4000);
      return;
    }

    lesson = lesson.data.content;
    lesson = await gptService.save_to_pdf(lesson, lessonTitle); // returns path to file
    res.status(200).sendFile(lesson);
     // Wait 4 seconds
     setTimeout(() => {
      fs.unlink(lesson, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully");
        }
      });
    }, 4000);
    return;
  } catch (error) {
    console.error("Error retrieving summary:", error);
    res.status(500).send("Error retrieving summary");
  }
});

app.get('/api/quiz/:courseID/:lessonTitle', async (req, res) => {
  try {
    console.log("Getting quiz")
    const lessonTitle = req.params.lessonTitle;
    console.log("Lesson Title: ", lessonTitle);
    const courseID = req.params.courseID;
    console.log("Course ID: ", courseID);
    // get lessonID from lessonTitle
    const lesson = await Lesson.findOne({
      title: lessonTitle,
      courseID: courseID
    });
    // check if lesson already has a quiz
    let quiz = await Quiz.findOne({ lessonID: lesson._id });
    if (!quiz) {
      console.log("No quiz found for lesson, gonna generate one real quick.");
      // get assistantID from courseID
      const course = await Course.findById(courseID);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const assistantID = course.assistantID;
      const threadID = course.threadID;
      quiz = await gptService.generate_quiz(assistantID, lessonTitle, threadID);
      // add quiz to course
      course.addQuizzes([quiz._id]);
    }
    console.log("Quiz:", quiz.questions);
    res.status(200).send(quiz.questions);
  }
  catch (error) {
    console.error("Error retrieving quiz:", error);
    res.status(500).send("Error retrieving quiz");
  }
});
// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
