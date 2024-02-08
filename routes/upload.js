// upload.js
// Handles file uploads and assistant creation. 
// Inputs: File
// Stores assistant ID in the database in the course collection, along with the user who created the course.


const express = require("express");
const multer = require("multer");
const router = express.Router();
const gptService = require("../gptService");
const fs = require("fs");
const path = require("path");

const Course = require("../models/course");

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const file = multer({ storage: storage });

// POST route to handle file upload
router.post("/", file.single("file"), async (req, res) => {
  try {
    // Process file with gptService --> CHANGE THIS ONCE DB IS IMPLEMENTED
    const filename = path.join("./uploads/", req.file.filename);
    const fileID = await gptService.uploadFile(filename);
    console.log("File: " + fileID);

    // Create assistant
    const assistant = await gptService.createAssistant(fileID);


    // Create a course in the database
    const newCourse = new Course({
      createdBy: '65c2d10b2622ee2ecf60095b',
      assistantID: assistant.id,
    });
    newCourse.save().then((result) => {
      console.log(result);
    });

    // Delete file after processing
    fs.unlink(filename, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("File deleted successfully");
      }
    });
    return res.status(200).json({
        message: "File uploaded and processed successfully",
        file: req.file,
        assistant: assistant,
        courseID: newCourse._id,
      });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;