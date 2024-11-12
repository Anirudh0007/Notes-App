require('dotenv').config();
const config = require('./config.json');
const mongoose = require('mongoose');

mongoose.connect(config.connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Could not connect to MongoDB:', error));

const User = require('./models/user.model');
const Note = require('./models/note.model');

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./utilities');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.json({ data: 'hello' });
});

app.post('/create-account', async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName) {
    return res.status(400).json({ error: true, message: 'Full Name is required' });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ error: true, message: 'Password is required' });
  }

  const isUser = await User.findOne({ email: email });
  if (isUser) {
    return res.status(409).json({ error: true, message: 'User already exists' });
  }

  const user = new User({
    fullName, email, password
  });
  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1h',
  });
  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration successful"
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  const userInfo = await User.findOne({ email: email });
  if (!userInfo) {
    return res.status(400).json({ message: 'User not found' });
  }
  if (userInfo.email === email && userInfo.password === password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });
    return res.json({
      error: false,
      message: 'Login Successful',
      email,
      accessToken,
    });
  } else {
    return res.json({
      error: true,
      message: 'Invalid Credentials'
    });
  }
});

app.post('/add-note', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ error: true, message: 'Title is required' });
  }
  if (!content) {
    return res.status(400).json({ error: true, message: 'Content is required' });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });
    await note.save();

    return res.json({
      error: false,
      note,
      message: 'Note added successfully',
    });
  } catch (error) {
    console.error("Error in /add-note:", error);
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error',
    });
  }
});

app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
  const { noteId } = req.params;
  const { title, content, tags, isPinned } = req.body;
  
  if (!req.user) {
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: req.user.user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: 'Note not found' });
    }

    // Update note fields if provided
    if (title) note.title = title;
    if (content) note.content = content;

    // Sanitize tags: ensure it's a flat array of strings
    if (Array.isArray(tags)) {
      note.tags = tags.flat().map(tag => String(tag));
    }

    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();
    return res.json({
      error: false,
      note,
      message: 'Note updated successfully',
    });
  } catch (error) {
    console.error("Error in /edit-note:", error);
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error.',
    });
  }
});


app.get('/get-all-notes/', authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: 'All the notes are retrieved successfully',
    });

  } catch (error) {
    console.error("Error in /get-all-notes:", error);
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error',
    });
  }
});

app.delete('/delete-note/:noteId', authenticateToken, async (req, res) => {
  const { noteId } = req.params;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: 'Note not found' });
    }
    await Note.deleteOne({ _id: noteId, userId: user._id });
    return res.json({
      error: false,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error("Error in /delete-note:", error);
    return res.status(500).json({
      error: true,
      message: 'Internal Server Error.',
    });
  }
});

app.put('/update-note-pinned/:noteId', authenticateToken, async (req, res) => {
  const { noteId } = req.params;
  const { isPinned } = req.body;
  const { user } = req.user;
  
  if (!req.user) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  try {
      const note = await Note.findOne({ _id: noteId, userId: user._id });

      if (!note) {
          return res.status(404).json({ error: true, message: 'Note not found' });
      }

      note.isPinned = isPinned;

      await note.save();
      return res.json({
          error: false,
          note,
          message: 'Note pinned status updated successfully',
      });
  } catch (error) {
      console.error("Error in /update-note-pinned:", error);
      return res.status(500).json({
          error: true,
          message: 'Internal Server Error.',
      });
  }
});

app.get('/get-user', authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }
  return res.json({
    user: { fullName: isUser.fullName, email: isUser.email, '_id': isUser._id, createdOn: isUser.createdOn },
    message: "",
  });
});
  app.get('/search-notes/', authenticateToken, async (req, res) => {
    const {user} = req.user; // req.user is populated by authenticateToken middleware
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: true, message: 'Search Query is needed' });
    }

    try {
      const matchingNotes = await Note.find({
        userId: user._id,
        $or: [
          { title: { $regex: new RegExp(query, 'i') } },
          { content: { $regex: new RegExp(query, 'i') } }
        ]
      });

      return res.json({
        error: false,
        notes: matchingNotes,
        message: "Matching notes retrieved successfully"
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: 'Internal Server Error'
      });
    }
  });

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});

module.exports = app;
