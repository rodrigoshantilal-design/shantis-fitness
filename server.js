const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shantis-fitness';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  fitnessPlan: { type: Object, default: null },
  trackingLogs: { type: Array, default: [] },
  progressEntries: { type: Array, default: [] },
  mealLogs: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Auth Routes

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name: name || null
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user data (including their saved fitness data)
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      fitnessPlan: user.fitnessPlan,
      trackingLogs: user.trackingLogs,
      progressEntries: user.progressEntries,
      mealLogs: user.mealLogs
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Save user data
app.post('/api/user/save', async (req, res) => {
  try {
    const { userId, fitnessPlan, trackingLogs, progressEntries, mealLogs } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updateData = { updatedAt: new Date() };
    if (fitnessPlan !== undefined) updateData.fitnessPlan = fitnessPlan;
    if (trackingLogs !== undefined) updateData.trackingLogs = trackingLogs;
    if (progressEntries !== undefined) updateData.progressEntries = progressEntries;
    if (mealLogs !== undefined) updateData.mealLogs = mealLogs;

    await User.findByIdAndUpdate(userId, updateData);

    res.json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Get user data
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      fitnessPlan: user.fitnessPlan,
      trackingLogs: user.trackingLogs,
      progressEntries: user.progressEntries,
      mealLogs: user.mealLogs
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// AI Coach
app.post('/api/coach', async (req, res) => {
  try {
    const { message, plan, language } = req.body;

    const systemPrompt = `You are a personal fitness and wellness coach for Shanti's Fitness & Wellness app.
Be encouraging, concise, and practical. Respond in ${language === 'pt' ? 'Portuguese (Brazil)' : 'English'}.
${plan ? `The user's fitness plan: goal is ${plan.goal}, current weight ${plan.weight}kg, target weight ${plan.targetWeight}kg, daily calories ${Math.round(plan.calories || 0)}, protein ${Math.round(plan.proteinG || 0)}g.` : ''}
Keep answers short and actionable (2-4 sentences max).`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 200
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (error) {
    console.error('Coach error:', error);
    res.status(500).json({ error: 'Failed to get coach response' });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
