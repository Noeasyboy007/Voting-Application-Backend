//Require dependencies
const express = require('express');
const app = express();
require('dotenv').config();

const Candidate = require('./models/candidate');


//Import the DB connection Files
const db = require('./connections/db');


// Set the view engine to use EJS
app.set('view engine', 'ejs');


const bodyParser = require('body-parser');
app.use(bodyParser.json()); //req.body


// Import the Router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);




// Assuming you have a route like this in your Express app
app.get('/', async (req, res) => {
    try {
        // Retrieve candidates data from your database
        const candidates = await Candidate.find(); // Adjust this based on your actual data retrieval logic

        // Assuming you have logic to determine the user here
        const user = req.user; // This is just an example, replace it with your actual user data

        // Pass the candidates and user variables to the template when rendering it 
        res.render('index', { candidates: candidates, user: user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// Define route handlers for login and signup
app.get('/login', (req, res) => {
    res.render('login'); // Render login.ejs
});

app.get('/signup', (req, res) => {
    res.render('signup'); // Render signup.ejs
});







//Set PORT environment
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => { console.log(`Listen on PORT ${PORT}`) });

