// server.js

const express = require('express');
const gptService = require('./gptService');
const cors = require('cors');
const fs = require('fs')
const path = require('path')
const multer = require('multer'); // Handling file uploads
const upload = multer({ storage: multer.memoryStorage()}); // In-memory storage for uploaded files

// const mongoose = require('mongoose');
// const User = require('./models/user'); // database schemas for mongoDB
// const TextFile = require('./models/textFile'); // database schemas for mongoDB



// // establish a mongoDB connection --> NOT SAFE
// mongoose.connect('mongodb+srv://aknez1406:Hedgren99@brainiacmvp.qljozsh.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// // listen to the 'open' event to confirm a successful connection
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log("Connected successfully to MongoDB");
// });

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors()); // Enable CORS for all routes
let assistant;

// Function to write buffer to a temporary file
function writeBufferToTempFile(buffer, callback) {
    // Generate a unique filename
    const fileName = "upload" + Date.now().toString();
    // Write the buffer to a temporary file
    fs.writeFile(fileName, buffer, (err) => {
      if (err) {
        console.error("Error writing file to temp:", err);
        return callback(err);
      }
      callback(null, fileName);
    });
  }


// Route for uploading a single file to OpenAI
app.post('/upload', upload.single('file'), (req, res) => {
    // Create a temporary file from buffer
    writeBufferToTempFile(req.file.buffer, async (err, fileName) => {
      if (err) {
        return res.status(500).json('Error writing file');
      }
      
      // Process file with gptService
      const file = await gptService.uploadFile(fileName);
      console.log("File: " + file);

      // Create assistant
      const assistant = gptService.createAssistant(file);
      // Initiate Tutor Assistant and Student Assistant

      // Delete the temporary file after processing
      fs.unlink(fileName, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
      res.json('File processed');
    });
  });
  
// Root route - just a basic response for testing
app.post('/generateMaterials', async (req, res) => {
    let assistantID = 'asst_OibuqnbxGSfKJAroeLUcTT5D'
    // Generate the curriculum (returns a JSON object of curriculum)
    const curriculum = await gptService.generate_curriculum(assistantID); // HARDCODED
    console.log(JSON.stringify(curriculum));

    // Generate a topic intro and summary of curriculum PDF
    // Store it in DB
    

    // Loop through each lecture, creating PDF summary, notes, and 
    // JSON format quiz with multiple choice questions and correct answers
})

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));