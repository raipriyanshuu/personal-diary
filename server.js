const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const session = require('express-session');
const path = require('path');
const User = require('./src/models/user');
const DiaryEntry = require('./src/models/DiaryEntry');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET, // Replace with your own secret key
  resave: false,             // Prevents session being saved back to the session store if it wasn't modified
  saveUninitialized: false,  // Prevents uninitialized sessions from being saved
  cookie: { secure: false }  // Set secure: true if you're using HTTPS
}));


// Middleware to protect routes (authentication)
// Middleware to protect routes (authentication)
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    // Ensure the token is validated using the JWT_SECRET from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};


// Serve static files from public folder
app.use(express.static('public'));

// Home route (serves the frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','settings.html')); // Make sure this points to your settings.html file path
});

// Signup route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!password) {
    return res.status(400).json({ msg: 'Password is required' });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return the token to the frontend
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



// POST - Create a new diary entry
// POST - Create a new diary entry
app.post('/diary', authMiddleware, async (req, res) => {
  const { title, content, category, pin } = req.body;  // Added pin field

  try {
      // req.user is set by authMiddleware
      const newEntry = new DiaryEntry({
          user: req.user.userId,  // Use req.user from the middleware
          title,
          content,
          category,  // Include the category
          pin: pin || false  // Set pin value (default false)
      });

      await newEntry.save();
      res.json(newEntry);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

// PUT - Update an existing diary entry
app.put('/diary/:id', authMiddleware, async (req, res) => {
  const { title, content, category, pin } = req.body;

  try {
      const updatedEntry = await DiaryEntry.findOneAndUpdate(
          { _id: req.params.id, user: req.user.userId },
          { title, content, category, pin, date: new Date() },  // Include pin and date update
          { new: true }
      );

      if (!updatedEntry) return res.status(404).json({ msg: "Entry not found" });

      res.json(updatedEntry);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});
// GET - Retrieve an entry and verify password if needed
app.get('/diary', authMiddleware, async (req, res) => {
  try {
      // Fetch all entries for the logged-in user
      const entries = await DiaryEntry.find({ user: req.user.userId })
      .populate('user', 'username');  // Populate the user field, only select the username field

      res.json(entries);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});


// // Update an existing diary entry (protected route)
// app.put('/diary/:id', authMiddleware, async (req, res) => {
//   const { title, content } = req.body;

//   try {
//     // Find and update the diary entry by ID and user
//     const updatedEntry = await DiaryEntry.findOneAndUpdate(
//       { _id: req.params.id, user: req.user.userId },
//       { title, content, date: new Date() },  // Update the date
//       { new: true }
//     );

//     if (!updatedEntry) return res.status(404).json({ msg: "Entry not found" });

//     res.json(updatedEntry);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });



// PUT - Pin or unpin an entry
app.put('/diary/:id/pin', authMiddleware, async (req, res) => {
  const { pinned } = req.body;

  try {
      const updatedEntry = await DiaryEntry.findOneAndUpdate(
          { _id: req.params.id, user: req.user.userId },
          { pinned },
          { new: true }
      );

      if (!updatedEntry) return res.status(404).json({ msg: "Entry not found" });

      res.json(updatedEntry);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});


// Delete a diary entry (protected route)
app.delete('/diary/:id', authMiddleware, async (req, res) => {
  try {
    // Find and delete the diary entry by ID and user
    const entry = await DiaryEntry.findOneAndDelete({ _id: req.params.id, user: req.user.userId });

    if (!entry) return res.status(404).json({ msg: "Entry not found" });

    res.json({ msg: "Entry deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update User Profile
app.put('/settings/profile', authMiddleware, async (req, res) => {
  const { username, email } = req.body;

  try {
      const updatedUser = await User.findByIdAndUpdate(
          req.user.userId,
          { username, email },
          { new: true }
      );

      if (!updatedUser) return res.status(404).json({ msg: "User not found" });

      res.json(updatedUser);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

// Change Password
app.put('/settings/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
      const user = await User.findById(req.user.userId);

      if (!user) return res.status(404).json({ msg: "User not found" });

      // Check if current password matches
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Incorrect current password" });

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ msg: "Password updated successfully" });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

// Delete Account
app.delete('/settings/account', authMiddleware, async (req, res) => {
  try {
      const user = await User.findByIdAndDelete(req.user.userId);

      if (!user) return res.status(404).json({ msg: "User not found" });

      res.json({ msg: "Account deleted successfully" });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});


// Route to update user profile
app.put('/update-profile', authMiddleware, async (req, res) => {
  const { username, email } = req.body;

  try {
      // Find the user by ID and update their username and email
      const updatedUser = await User.findByIdAndUpdate(
          req.user.userId,  // Extracted from the JWT via authMiddleware
          { username, email },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ msg: "User not found" });
      }

      res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).send('Server error');
  }
});

// Route to change password
app.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
      const user = await User.findById(req.user.userId);

      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }

      // Check if the current password matches
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({ msg: 'Current password is incorrect' });
      }

      // Hash the new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ msg: 'Password updated successfully' });
  } catch (err) {
      console.error('Error changing password:', err);
      res.status(500).send('Server error');
  }
});


// Route to delete user account
app.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
      const user = await User.findByIdAndDelete(req.user.userId);

      if (!user) {
          return res.status(404).json({ msg: 'User not found' });
      }

      res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
      console.error('Error deleting account:', err);
      res.status(500).send('Server error');
  }
});


const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/google/callback', // Change for production
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        username: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Serialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

app.use(passport.initialize());
app.use(passport.session());

// Google login route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback route
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/'); // Redirect to the main page after login
  }
);




