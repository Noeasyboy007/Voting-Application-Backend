//import the dependencies 
const mongoose = require('mongoose');

// Create a variable and store the (process.env.MONGO_URL) environment
const mongoUrl = process.env.MONGO_URL

//Create  MONGO_DB Connections
mongoose.connect(mongoUrl)
    .then(() => console.log("MongoDb Connected"))
    .catch((err) => console.error('Mongo Connection Error:', err));


const db = mongoose.connection;

module.exports = db;