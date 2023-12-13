const express = require('express');
const mongoose = require('mongoose');
// database schemas for mongoDB
const User = require('./models/user');
const TextFile = require('./models/textFile');
// establish a mongoDB connection --> NOT SAFE
mongoose.connect('mongodb+srv://aknez1406:Hedgren99@brainiacmvp.qljozsh.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// listen to the 'open' event to confirm a successful connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected successfully to MongoDB");
});

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log("Testtest")