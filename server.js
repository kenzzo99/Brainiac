// server.js

// Module Dependencies
const express = require("express");
const gptService = require("./gptService");
const cors = require("cors");
const uploadRouter = require("./routes/upload");
const axios = require('axios');
// MongoDB dependencies and models.
const mongoose = require("mongoose");
const User = require("./models/user"); // database schemas for mongoDB
const Lesson = require("./models/lesson");
const Course = require("./models/course");

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

// /**
//  * Writes a buffer to a temporary file.
//  *
//  * @param {Buffer} buffer - The buffer to write to a file.
//  * @param {function} callback - The callback function to execute after the file has been written.
//  * @returns {void}
//  */
// function writeBufferToTempFile(buffer, callback) {
//     // Generate a unique filename
//     const fileName = "upload" + Date.now().toString();
//     // Write the buffer to a temporary file
//     fs.writeFile(fileName, buffer, (err) => {
//       if (err) {
//         console.error("Error writing file to temp:", err);
//         return callback(err);
//       }
//       callback(null, fileName);
//     });
//   }


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
    
    console.log("We are here");
    // Generate the summary for the given lesson
    let summary = await gptService.generate_summary(assistantID, lessonTitle);
    // Create new Lesson db entry using summary
    const newLesson = new Lesson({
        title: lessonTitle,
        content: summary,
        courseID: courseID,
    });
    newLesson.save().then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });
    // Add the lesson to the course
    course.addLessons(newLesson.id);
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
  let curriculum = await gptService.generate_curriculum(assistantID);
  // Store the curriculum for the course
  course.curriculum = JSON.stringify(curriculum);
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

  let summaries = gptService.generate_summaries(assistantID, curriculum, thread);

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
    console.error('Error retrieving curriculum:', error);
    res.status(500).send('Error retrieving curriculum');
  }
});



// Route for fetching the summary for a lesson
app.get("/api/summary/:courseID/:lessonTitle", async (req, res) => {
  try {
    const courseID = req.params.courseID;
    const lessonTitle = req.params.lessonTitle;
    console.log("Course ID: ", courseID);
    console.log("Lesson Title: ", req.params.lessonTitle);
    const lesson = await Lesson.findOne({ courseID: courseID, title: lessonTitle });
    if (!lesson) {
      // Call the generateSummary route
      const summaryResponse = await axios.post(`http://localhost:5000/generateSummary`, {
        courseID: courseID,
        lessonTitle: lessonTitle
      });
      console.log("Summary Response: ", summaryResponse.data);
      const summary = summaryResponse.data;
      return res.status(200).json( summary );
    }
    res.send(lesson.content);
  } catch (error) {
    console.error('Error retrieving summary:', error);
    res.status(500).send('Error retrieving summary');
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
