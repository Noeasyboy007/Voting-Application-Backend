// Import the dependencies
const express = require('express');
const router = express.Router();

//Import User model Schema file from models
const User = require('../models/user');

//Import jwt Authentication from auth
const { jwtAuthMiddleware, generateToken } = require('../auth/jwt');


//Signup Route (for create a new user account)
router.post('/signup', async (req, res) => {
    try {
        const data = req.body //Asume the rquest body contains the  User data

        // Check if there is already an admin user
        const adminUser = await User.findOne({ role: 'admin' });
        if (data.role === 'admin' && adminUser) {
            return res.status(400).json({ error: 'Admin user already exists' });
        }

        // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }

        // Check if a user with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
        }

        //Create a new User document using the Mongoose model
        const newUser = new User(data);

        //saved the user to Mongo database
        const response = await newUser.save();
        console.log("New user data saved");

        const payload = { id: response.id };

        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        res.status(200).json({ response: response, token: token });

    }

    catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Login Route (for login in exsting user via Aadhar number and password)
router.post('/login', async (req, res) => {

    try {
        // Extract username and password from request body
        const { aadharCardNumber, password } = req.body;


        // Check if aadharCardNumber or password is missing
        if (!aadharCardNumber || !password) {
            return res.status(400).json({ error: " aadharCardNumber or password is Required" })
        };


        // Find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });


        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid Aadhar Card Number or Password' });
        }


        //Generate Token 
        const payload = { id: user.id };
        const token = generateToken(payload);

        //return token as a response
        res.json({ token });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ erroe: "Internal server error" });
    }

});


// profile Route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;

        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({ user });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

 
//Login user Profile update put method
router.put('/profile/password', async (req, res) => {
    try {
        //Extract the id from the token
        const userId = req.user;

        //Extract the current and new password from request body
        const { currentPassword, newPassword } = req.body;

        //Find the user by userId
        const user = await User.findById(userId);

        //If password does not match return error
        if (!(await user.comparePassword(currentPassword))) { 
            return res.status(401).json({ error: 'Invalid password' }) 
        };

        //Update allow the  user's password
        user.password = newPassword;
        await user.save();

        console.log("Password Changed Sucessfully");
        res.status(200).json({ message: "Password Changed Sucessfully" });

    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;


