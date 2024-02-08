// MongoDB dependencies and models.
const mongoose = require("mongoose");
const User = require("./models/user"); // database schemas for mongoDB
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


// Create a new user
const user = new User({
    username: 'aknez',
    email: 'email@example.com',
    password: 'password',
    name: 'Antonio',
});

// Save the user
user.save()
    .then(savedUser => {
        console.log('User saved successfully:', savedUser);
    })
    .catch(err => {
        console.error(err);
    });