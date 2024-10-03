const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const User = require('./models/User');
const MessOwner = require('./models/owner'); // Import the MessOwner model
const Mess = require('./models/Mess');
const Review = require('./models/Review');
const session = require('express-session');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON requests
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Session Middleware
app.use(session({
    secret: 'yourSecretKey', // Replace with a secure random key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Connect to MongoDB
mongoose.connect('mongodb+srv://gauravhadge58:Gaurav%402908@messkart.4a377.mongodb.net/trial', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Check for connection success
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, phone });
        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Route to fetch all messes
app.get('/messes', async (req, res) => {
    try {
        const messes = await Mess.find();
        res.json(messes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to fetch all reviews
app.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json({ message: 'Invalid credentials' });

        // Set session data
        req.session.username = user.name; // Store username in session
        req.session.userId = user._id; // Store user ID in session for profile access

        res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Route to fetch the logged-in user's profile
app.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    try {
        const user = await User.findById(req.session.userId).select('-password'); // Exclude password field
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send user information
        res.json({ name: user.name, email: user.email, phone: user.phone, location: user.location });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Route to fetch details of a specific mess by name
app.get('/messes/:name', async (req, res) => {
    const { name } = req.params;
    console.log("Fetching mess details for:", name); // Check what's coming in the request

    try {
        const mess = await Mess.findOne({ name: { $regex: new RegExp(`^${decodeURIComponent(name)}$`, "i") } });
        if (mess) {
            res.json(mess);
        } else {
            res.status(404).json({ message: 'Mess not found' });
        }
    } catch (error) {
        console.error('Error fetching mess details:', error);
        res.status(500).json({ message: 'Error fetching mess details' });
    }
});

// Route to update details of a specific mess
app.put('/messes/:name', async (req, res) => {
    const { name } = req.params;
    const updateData = req.body; // Get update data from request body
    console.log("Updating mess details for:", name, "with data:", updateData); // Check update data

    try {
        const updatedMess = await Mess.findOneAndUpdate(
            { name: { $regex: new RegExp(`^${decodeURIComponent(name)}$`, "i") } },
            { $set: updateData }, // Use $set to update specific fields
            { new: true } // Return the updated document
        );

        if (updatedMess) {
            res.json(updatedMess); // Send the updated mess details back
        } else {
            res.status(404).json({ message: 'Mess not found for update' });
        }
    } catch (error) {
        console.error('Error updating mess details:', error);
        res.status(500).json({ message: 'Error updating mess details' });
    }
});

// Route to get the logged-in user's username
app.get('/dashboard', (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// Route to add a new mess
// Route to add a new mess
// Route to add a new mess
// app.post('/messes', async (req, res) => {
//     console.log('Received request to add mess:', req.body); // Log the request body for debugging
//     const { name, location, image, menu } = req.body; // Change `address` to `location` here

//     try {
//         const newMess = new Mess({ name, location, image, menu }); // Make sure to include all fields
//         await newMess.save();
//         res.status(201).json({ message: 'Mess added successfully!' });
//     } catch (error) {
//         console.error('Error adding mess:', error);
//         res.status(500).json({ message: 'Error adding mess', error });
//     }
// });


// Signup Route for Mess Owners
// server.js (Add this inside your existing code)

app.post('/owners/signup', async (req, res) => {
    const { owner, name, address, image, menu, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newMess = new Mess({
            name,
            address,
            image,
            menu,
            owner,
            password: hashedPassword // Store hashed password
        });

        await newMess.save();
        res.status(201).json({ message: 'Owner registered and mess added successfully!' });
    } catch (error) {
        console.error('Error during owner signup:', error);
        res.status(500).json({ message: 'Error registering owner', error });
    }
});

// Owner Dashboard Route (To show owner's mess details)
app.get('/owners/dashboard', async (req, res) => {
    if (!req.session.ownerId) {
        return res.status(401).json({ message: 'Unauthorized, please log in.' });
    }

    try {
        const mess = await Mess.findById(req.session.ownerId);
        if (!mess) {
            return res.status(404).json({ message: 'Mess not found.' });
        }

        // Render a simple dashboard with mess information
        res.json({
            name: mess.name,
            address: mess.address,
            image: mess.image,
            menu: mess.menu,
            owner: mess.owner
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ message: 'Error fetching mess details.' });
    }
});


// Update Mess Info Route
app.put('/owners/update-mess', async (req, res) => {
    if (!req.session.ownerId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const updatedData = req.body;
        const updatedMess = await Mess.findByIdAndUpdate(req.session.ownerId, updatedData, { new: true });

        if (!updatedMess) {
            return res.status(404).json({ message: 'Mess not found' });
        }

        res.json({ message: 'Mess updated successfully!', mess: updatedMess });
    } catch (error) {
        console.error('Error updating mess:', error);
        res.status(500).json({ message: 'Error updating mess' });
    }
});



/// Mess Owner Login Route
app.post('/owners/login', async (req, res) => {
    const { owner, password } = req.body;

    try {
        const messOwner = await Mess.findOne({ owner }); // Find mess by owner's name
        if (!messOwner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        // Compare the hashed password
        const isValidPassword = await bcrypt.compare(password, messOwner.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Set session data for the logged-in owner
        req.session.ownerId = messOwner._id; // Store owner ID in session

        res.json({ message: 'Login successful!' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login', error });
    }
});


app.get('/owners/messes', async (req, res) => {
    const ownerId = req.session.ownerId; // Get owner ID from session
    if (!ownerId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const messes = await Mess.find({ owner: ownerId }); // Assuming Mess model exists and has an owner field
        res.json(messes);
    } catch (error) {
        console.error('Error fetching messes:', error);
        res.status(500).json({ message: 'Error fetching messes', error });
    }
});


app.post('/owners/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: 'Logout successful' });
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
