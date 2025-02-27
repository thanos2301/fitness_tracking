import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';
import multer from 'multer';
import { Readable } from 'stream';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prismaClient = new PrismaClient();

const upload = multer();

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prismaClient.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Error signing in' });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await prismaClient.profile.findUnique({
      where: {
        userId: req.userId
      }
    });
    
    if (!profile) {
      return res.json({
        name: '',
        gender: '',
        dob: null,
        country: '',
        height: null,
        weight: null
      });
    }
    
    res.json(profile);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, gender, dob, country, height, weight } = req.body;

    // Validate required fields
    if (!name || !gender || !dob || !country || !height || !weight) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate height and weight
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (heightNum < 1 || heightNum > 300) {
      return res.status(400).json({ error: 'Height must be between 1 and 300 cm' });
    }

    if (weightNum < 1 || weightNum > 500) {
      return res.status(400).json({ error: 'Weight must be between 1 and 500 kg' });
    }

    // Update or create profile using upsert
    const profile = await prismaClient.profile.upsert({
      where: {
        userId: req.userId
      },
      update: {
        name,
        gender,
        dob: new Date(dob),
        country,
        height: heightNum,
        weight: weightNum,
      },
      create: {
        userId: req.userId,
        name,
        gender,
        dob: new Date(dob),
        country,
        height: heightNum,
        weight: weightNum,
      }
    });

    res.json(profile);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Get rehabilitation info with audio
router.get('/rehabilitation', auth, async (req, res) => {
  try {
    const rehab = await prismaClient.rehabilitation.findUnique({
      where: { userId: req.userId }
    });

    if (!rehab) {
      return res.json({ description: '' });
    }

    // Convert audio buffer to base64 if it exists
    const response = {
      ...rehab,
      audioRecording: rehab.audioRecording 
        ? {
            data: rehab.audioRecording.toString('base64'),
            mimeType: rehab.audioMimeType
          }
        : null
    };

    res.json(response);
  } catch (err) {
    console.error('Rehabilitation fetch error:', err);
    res.status(500).json({ error: 'Error fetching rehabilitation information' });
  }
});

// Save rehabilitation info with audio
router.post('/rehabilitation', auth, upload.single('audio'), async (req, res) => {
  try {
    const { description } = req.body;

    if (!description?.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    let audioBuffer = null;
    let audioMimeType = null;

    if (req.file) {
      audioBuffer = req.file.buffer;
      audioMimeType = req.file.mimetype;
    }

    const rehab = await prismaClient.rehabilitation.upsert({
      where: { userId: req.userId },
      update: {
        description,
        audioRecording: audioBuffer,
        audioMimeType
      },
      create: {
        userId: req.userId,
        description,
        audioRecording: audioBuffer,
        audioMimeType
      }
    });

    res.json(rehab);
  } catch (err) {
    console.error('Rehabilitation save error:', err);
    res.status(500).json({ error: 'Error saving rehabilitation information' });
  }
});

// Speech to text endpoint
router.post('/speech-to-text', auth, async (req, res) => {
  try {
    // Get the audio file from the request
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFile = req.files.audio;

    // For now, return a simple response
    // In production, you would want to use a proper speech-to-text service
    res.json({ text: "Speech to text conversion is not yet implemented." });

  } catch (err) {
    console.error('Speech to text error:', err);
    res.status(500).json({ error: 'Error processing speech to text' });
  }
});

export default router; 